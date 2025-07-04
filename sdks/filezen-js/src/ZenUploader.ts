import axios, { AxiosProgressEvent } from 'axios';
import { MULTIPART_CHUNK_SIZE, MULTIPART_THRESHOLD } from './constants';
import {
  FinishMultipartUploadParams,
  MultipartChunkUploadResult,
  MultipartUploadChunkParams,
  StartMultipartUploadParams,
  UploadMode,
  ZenFile,
  ZenStorageUploadOptions,
  ZenUploaderParams,
  ZenUploadSource,
} from './types';
import { isNode } from './utils';
import { ZenError } from './ZenError';
import {
  buildZenErrorResult,
  buildZenSuccessResult,
  ZenResult,
} from './ZenResult';
import { ZenUpload } from './ZenUpload';

export type ZenUploaderOptions = {
  url?: string;
  signUrl?: string;
  headers?: { [key: string]: string | number };
};

export class ZenUploader {
  constructor(readonly options: ZenUploaderOptions) {}

  buildUpload(
    source: ZenUploadSource,
    options?: ZenStorageUploadOptions,
  ): ZenUpload {
    return ZenUpload.fromSource(this, source, options);
  }

  async uploadFile(
    source: ZenUploadSource,
    params: ZenUploaderParams,
  ): Promise<ZenResult<ZenFile>> {
    try {
      if (typeof source === 'string') {
        if (this.isUrl(source)) {
          return await this.uploadFromUrl(source, params);
        } else if (this.isBase64(source)) {
          return await this.uploadFromBase64(source, params);
        }
        return await this.uploadFromText(source, params);
      }
      if (isNode && Buffer.isBuffer(source)) {
        return await this.uploadFromBlob(
          new Blob([source], {
            type: params?.mimeType ?? 'application/octet-stream',
          }),
          params,
        );
      }
      return await this.uploadFromBlob(source as Blob, params);
    } catch (error) {
      return buildZenErrorResult(error);
    }
  }

  private async uploadFromBlob(source: Blob, params: ZenUploaderParams) {
    // For small files, use regular upload
    if (source.size <= MULTIPART_THRESHOLD) {
      return await this.singleBlobUpload(source, params);
    }
    return await this.multipartBlobUpload(source, params);
  }

  private async uploadFromUrl(
    url: string,
    params: ZenUploaderParams,
  ): Promise<ZenResult<ZenFile>> {
    // For string sources (URLs), fetch the data and stream it
    const response = await fetch(url, {
      signal: params.abortController?.signal,
    });

    if (!response.ok) {
      throw new ZenError(
        response.status,
        `Failed to fetch from URL: ${response.statusText}`,
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new ZenError(-1, 'Failed to get reader from response body');
    }
    // Initialize multipart upload
    const { id: sessionId } = await this.startMultipartUpload({
      fileName: params.name!,
      mimeType: params.mimeType!,
      metadata: params.metadata,
      uploadMode: UploadMode.STREAMING,
      parentId: params.folderId,
      projectId: params.projectId,
    });

    let isDone = false;

    while (!isDone) {
      // Read exactly CHUNK_SIZE bytes
      const chunks: Uint8Array[] = [];
      let bytesRead = 0;

      while (bytesRead < MULTIPART_CHUNK_SIZE && !isDone) {
        const { done, value } = await reader.read();

        if (done) {
          isDone = true;
          // Don't break here - we still need to add the last value if it exists
        }

        if (value) {
          chunks.push(value);
          bytesRead += value.length;
        }

        if (isDone) {
          break;
        }
      }

      // Upload the chunk (full or partial)
      if (bytesRead > 0) {
        const chunk = new Blob(chunks);

        await this.uploadMultipartPart({
          sessionId,
          chunk,
          abortController: params.abortController,
          onUploadProgress: (progress) => {
            params.onUploadProgress?.({
              bytes: progress.loaded,
              total: progress.total,
              percent: (progress.progress ?? 0) * 100,
            });
          },
        });
      }
    }
    const file = await this.finishMultipartUpload({
      sessionId,
      abortController: params.abortController,
    });
    return buildZenSuccessResult(file);
  }

  private async uploadFromBase64(
    base64: string,
    params: ZenUploaderParams,
  ): Promise<ZenResult<ZenFile>> {
    let blob: Blob;

    if (base64.startsWith('data:')) {
      // Handle data URL format (data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...)
      const [header, data] = base64.split(',');
      const mimeMatch = header!.match(/data:([^;]+)/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

      if (!params.mimeType) {
        params.mimeType = mimeType;
      }

      const binaryString = atob(data!);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      blob = new Blob([bytes], { type: mimeType });
    } else {
      // Handle pure base64 string
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      blob = new Blob([bytes], {
        type: params.mimeType || 'application/octet-stream',
      });
    }
    // Upload the decoded blob
    return await this.uploadFromBlob(blob, params);
  }

  private async uploadFromText(
    text: string,
    params: ZenUploaderParams,
  ): Promise<ZenResult<ZenFile>> {
    const blob = new Blob([text], {
      type: params.mimeType || 'text/plain',
    });

    // Upload the text blob
    return await this.uploadFromBlob(blob, params);
  }

  private async singleBlobUpload(
    source: Blob,
    params: ZenUploaderParams,
  ): Promise<ZenResult<ZenFile>> {
    const formData = new FormData();
    formData.append('file', source, params.name);
    formData.append('size', source.size.toString());
    if (params.name) {
      formData.append('name', params.name);
    }
    if (params.mimeType) {
      formData.append('type', params.mimeType);
    }
    if (params.metadata) {
      formData.append('metadata', JSON.stringify(params.metadata));
    }

    const headers: { [key: string]: string | number } = {
      ...this.options.headers,
    };
    if (params.projectId) {
      headers['X-Project-Id'] = params.projectId;
    }
    if (params.folderId) {
      headers['X-Folder-Id'] = params.folderId;
    }

    const fileInfo = this.resolveFileInfo(source, params);
    const uploadUrl = await this.resolveUploadUrl(
      '/files/upload',
      fileInfo.name,
    );

    return await axios
      .post(uploadUrl, formData, {
        headers: headers,
        signal: params.abortController?.signal,
        onUploadProgress: (progress: AxiosProgressEvent) => {
          params.onUploadProgress?.({
            bytes: progress.loaded,
            total: progress.total ?? source.size,
            percent: (progress.progress ?? 0) * 100,
          });
        },
      })
      .then((result) => {
        return buildZenSuccessResult(result.data);
      })
      .catch((error) => {
        return buildZenErrorResult(error);
      });
  }

  private async multipartBlobUpload(
    source: Blob,
    params: ZenUploaderParams,
  ): Promise<ZenResult<ZenFile>> {
    // For large files, use multipart upload
    const fileSize = source.size;
    const fileInfo = this.resolveFileInfo(source, params);

    // Initialize multipart upload
    const { id: sessionId } = await this.startMultipartUpload({
      fileName: fileInfo.name,
      mimeType: fileInfo.mimeType,
      totalSize: fileSize,
      metadata: params.metadata,
      uploadMode: UploadMode.CHUNKED,
      parentId: params.folderId,
      projectId: params.projectId,
    });

    const totalChunks = Math.ceil(fileSize / MULTIPART_CHUNK_SIZE);
    let currentChunkIndex = 0;

    while (currentChunkIndex < totalChunks) {
      const start = currentChunkIndex * MULTIPART_CHUNK_SIZE;
      const end = Math.min(start + MULTIPART_CHUNK_SIZE, fileSize);
      const chunk = source.slice(start, end);

      const result = await this.uploadMultipartPart({
        sessionId,
        chunk,
        chunkIndex: currentChunkIndex,
        abortController: params.abortController,
        onUploadProgress: (progress) => {
          // Calculate overall progress including all chunks
          const chunkProgress = progress.total
            ? progress.loaded / progress.total
            : 0;
          const overallProgress =
            (currentChunkIndex + chunkProgress) / totalChunks;
          params.onUploadProgress?.({
            bytes:
              (currentChunkIndex + 1) * MULTIPART_CHUNK_SIZE + progress.loaded,
            total: progress.total ?? fileSize,
            percent: overallProgress * 100,
          });
        },
      });

      if (result.isComplete) {
        return buildZenSuccessResult(result.file!);
      }

      currentChunkIndex = result.nextChunkIndex ?? currentChunkIndex + 1;
    }

    throw new Error('Upload did not complete as expected');
  }

  /*
  Multipart upload
   */

  async startMultipartUpload(
    params: StartMultipartUploadParams,
  ): Promise<{ id: string }> {
    const headers: { [key: string]: string | number } = {
      ...this.options.headers,
    };
    if (params.projectId) {
      headers['X-Project-Id'] = params.projectId;
    }

    const uploadUrl = await this.resolveUploadUrl(
      '/files/chunk-upload/initialize',
      params.fileName,
    );

    const response = await axios.post(
      uploadUrl,
      {
        fileName: params.fileName,
        mimeType: params.mimeType,
        totalSize: params.totalSize,
        uploadMode: params.uploadMode,
        chunkSize: params.chunkSize ?? MULTIPART_CHUNK_SIZE,
        metadata: params.metadata,
        parentId: params.parentId,
        projectId: params.projectId,
      },
      { headers },
    );

    return response.data;
  }

  async uploadMultipartPart({
    sessionId,
    chunk,
    chunkIndex,
    abortController,
    onUploadProgress,
  }: MultipartUploadChunkParams): Promise<MultipartChunkUploadResult> {
    const formData = new FormData();
    formData.append('chunk', chunk);

    const headers: { [key: string]: string | number } = {
      ...this.options.headers,
      'Content-Type': 'multipart/form-data',
      'Chunk-Session-Id': sessionId,
      'Chunk-Size': chunk.size.toString(),
    };
    if (chunkIndex) {
      headers['Chunk-Index'] = chunkIndex.toString();
    }

    const targetUrl = this.options.url ?? 'https://api.filezen.dev';
    console.log('targetUrl', targetUrl);

    const response = await axios.post(
      `${targetUrl}/files/chunk-upload/part`,
      formData,
      {
        headers: headers,
        signal: abortController?.signal,
        onUploadProgress: onUploadProgress,
      },
    );

    return {
      file: response.data.file,
      isComplete: response.data.isComplete,
      nextChunkIndex: response.data.nextChunkIndex,
    };
  }

  async finishMultipartUpload({
    sessionId,
    abortController,
  }: FinishMultipartUploadParams): Promise<ZenFile> {
    const targetUrl = this.options.url ?? 'https://api.filezen.dev';
    const headers: { [key: string]: string | number } = {
      ...this.options.headers,
    };
    // Complete the multipart upload
    const completeResponse = await axios.post(
      `${targetUrl}/files/chunk-upload/complete`,
      { sessionId },
      {
        headers: headers,
        signal: abortController?.signal,
      },
    );
    return completeResponse.data.file;
  }

  /*
  Utils
   */

  private resolveFileInfo(source: ZenUploadSource, params: ZenUploaderParams) {
    return {
      name:
        params.name ||
        (source instanceof File ? source.name : `file-${Date.now()}`),
      mimeType:
        params.mimeType ||
        (source instanceof File ? source.type : 'application/octet-stream'),
    };
  }

  private async resolveUploadUrl(path: string, fileKey: string) {
    let result: string;
    if (this.options.signUrl) {
      const formData = new FormData();
      formData.append('path', path);
      formData.append('fileKey', fileKey);
      result = await axios
        .postForm(this.options.signUrl, formData)
        .then((res) => res.data.url)
        .catch((error) => {
          throw error;
        });
    } else {
      result = (this.options.url ?? 'https://api.filezen.dev') + path;
    }
    return result;
  }

  // String source helper methods
  private isUrl(str: string): boolean {
    try {
      new URL(str);
      return str.startsWith('http://') || str.startsWith('https://');
    } catch {
      return false;
    }
  }

  private isBase64(str: string): boolean {
    // Check for data URL format or pure base64
    return str.startsWith('data:') || /^[A-Za-z0-9+/]*={0,2}$/.test(str);
  }
}
