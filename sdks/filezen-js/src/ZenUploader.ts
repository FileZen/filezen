import axios, { AxiosProgressEvent } from 'axios';
import { MULTIPART_CHUNK_SIZE, MULTIPART_THRESHOLD } from './constants';
import {
  ZenFile,
  ZenStorageSource,
  ZenStorageUploadOptions,
  ZenUploaderParams,
  ZenUploadSource,
} from './types';
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
    source: ZenStorageSource,
    options?: ZenStorageUploadOptions,
  ): ZenUpload {
    let zenUpload: ZenUpload;
    if (source instanceof File) {
      zenUpload = ZenUpload.fromFile(this, source, {
        folder: options?.folder,
        folderId: options?.folderId,
        projectId: options?.projectId,
      });
    } else if (Buffer.isBuffer(source)) {
      if (!options?.name) {
        throw new Error('`name` is required for Buffer uploads');
      }
      zenUpload = ZenUpload.fromBuffer(this, source, {
        name: options.name,
        mimeType: options.mimeType,
        folder: options.folder,
        folderId: options.folderId,
        projectId: options.projectId,
      });
    } else if (source instanceof Blob) {
      if (!options?.name) {
        throw new Error('`name` is required for Buffer uploads');
      }
      zenUpload = ZenUpload.fromBlob(this, source, {
        name: options.name,
        mimeType: options.mimeType,
        folder: options.folder,
        folderId: options.folderId,
        projectId: options.projectId,
      });
    } else {
      throw new Error('String not implemented');
    }
    return zenUpload;
  }

  async uploadFile(
    source: ZenUploadSource,
    params: ZenUploaderParams,
  ): Promise<ZenResult<ZenFile>> {
    try {
      // If source is a string (URL) or small file, use regular upload
      if (
        typeof source === 'string' ||
        (source instanceof Blob && source.size <= MULTIPART_THRESHOLD)
      ) {
        return this.regularUpload(source, params);
      }

      // For large files, use multipart upload
      const fileSize = source.size;
      // Initialize multipart upload
      const { id: sessionId } = await this.initializeMultipartUpload(
        source,
        params,
      );

      const totalChunks = Math.ceil(fileSize / MULTIPART_CHUNK_SIZE);
      let currentChunkIndex = 0;

      while (currentChunkIndex < totalChunks) {
        const start = currentChunkIndex * MULTIPART_CHUNK_SIZE;
        const end = Math.min(start + MULTIPART_CHUNK_SIZE, fileSize);
        const chunk = source.slice(start, end);

        const result = await this.uploadChunk(
          sessionId,
          chunk,
          currentChunkIndex,
          (progress) => {
            // Calculate overall progress including all chunks
            const chunkProgress = progress.total
              ? progress.loaded / progress.total
              : 0;
            const overallProgress =
              (currentChunkIndex + chunkProgress) / totalChunks;
            params.onUploadProgress?.(overallProgress * 100);
          },
        );

        if (result.isComplete) {
          return buildZenSuccessResult(result.file!);
        }

        currentChunkIndex = result.nextChunkIndex ?? currentChunkIndex + 1;
      }

      throw new Error('Upload did not complete as expected');
    } catch (error) {
      return buildZenErrorResult(error);
    }
  }

  private async regularUpload(
    source: ZenUploadSource,
    params: ZenUploaderParams,
  ): Promise<ZenResult<ZenFile>> {
    const formData = new FormData();
    formData.append('file', source as any, params.name);
    if (params.name) {
      formData.append('name', params.name);
    }
    if (params.size) {
      formData.append('size', params.size.toString());
    } else if (source instanceof File) {
      formData.append('size', source.size.toString());
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
          params.onUploadProgress?.((progress.progress ?? 0) * 100);
        },
      })
      .then((result) => {
        return buildZenSuccessResult(result.data);
      })
      .catch((error) => {
        return buildZenErrorResult(error);
      });
  }

  private async initializeMultipartUpload(
    source: File | Blob,
    params: ZenUploaderParams,
  ): Promise<{ id: string }> {
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
      '/files/chunk-upload/initialize',
      fileInfo.name,
    );

    const response = await axios.post(
      uploadUrl,
      {
        fileName: fileInfo.name,
        mimeType: fileInfo.mimeType,
        totalSize: source.size,
        chunkSize: MULTIPART_CHUNK_SIZE,
        metadata: params.metadata,
      },
      { headers },
    );

    return response.data;
  }

  private async uploadChunk(
    sessionId: string,
    chunk: Blob,
    chunkIndex: number,
    onUploadProgress?: (progress: AxiosProgressEvent) => void,
  ): Promise<{
    isComplete: boolean;
    file?: ZenFile;
    nextChunkIndex?: number;
  }> {
    const formData = new FormData();
    formData.append('chunk', chunk);
    const headers: { [key: string]: string | number } = {
      'Content-Type': 'multipart/form-data',
      'Chunk-Session-Id': sessionId,
      'Chunk-Size': chunk.size.toString(),
      'Chunk-Index': chunkIndex.toString(),
      ...this.options.headers,
    };

    const targetUrl = this.options.url ?? 'https://api.filezen.dev';

    const response = await axios.post(
      `${targetUrl}/files/chunk-upload/part`,
      formData,
      {
        headers: headers,
        onUploadProgress: onUploadProgress,
      },
    );

    return {
      file: response.data.file,
      isComplete: response.data.isComplete,
      nextChunkIndex: response.data.nextChunkIndex,
    };
  }

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
}
