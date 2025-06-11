import axios, { AxiosError, AxiosInstance, AxiosProgressEvent } from 'axios';
import { ZenError, ZenFile, ZenList, ZenMetadata, ZenResult } from './types';

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
const MULTIPART_THRESHOLD = 10 * 1024 * 1024; // 10MB threshold for multipart upload

export type ZenApiOptions = {
  apiKey?: string;
  apiUrl?: string;
  authorization?: string;
};

export class ZenApi {
  private readonly apiUrl: string;
  private readonly axiosInstance: AxiosInstance;

  constructor(readonly options: ZenApiOptions = {}) {
    const targetApiKey =
      options.apiKey ??
      process.env.FILEZEN_API_KEY ??
      process.env.REACT_APP_FILEZEN_API_KEY ??
      process.env.NEXT_PUBLIC_FILEZEN_API_KEY;
    if (!targetApiKey && !options.authorization) {
      throw new Error(
        "No API key provided, it's should be provided in options or via environment variable FILEZEN_API_KEY or NEXT_PUBLIC_FILEZEN_API_KEY or REACT_APP_FILEZEN_API_KEY",
      );
    }
    this.apiUrl = options.apiUrl ?? 'https://api.filezen.dev';
    const headers: { [key: string]: any } = {};
    if (targetApiKey) {
      headers['ApiKey'] = targetApiKey;
    } else {
      headers['Authorization'] = `Bearer ${options.authorization}`;
    }
    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      headers: headers,
    });
  }

  setAuthorization(authorization?: string | null | undefined) {
    this.axiosInstance.defaults.headers['Authorization'] =
      authorization ?? null;
  }

  async uploadFile(
    source: string | File | Blob,
    params: {
      name?: string;
      size?: number;
      mimeType?: string;
      metadata?: ZenMetadata;
      projectId?: string | null;
      folderId?: string | null;
      abortController?: AbortController;
      onUploadProgress?: (percent: number) => void;
    },
  ): Promise<ZenResult<ZenFile>> {
    // If source is a string (URL) or small file, use regular upload
    if (
      typeof source === 'string' ||
      (source instanceof Blob && source.size <= MULTIPART_THRESHOLD)
    ) {
      return this.regularUpload(source, params);
    }

    // For large files, use multipart upload
    const fileSize = source.size;
    try {
      // Initialize multipart upload
      const { id: sessionId } = await this.initializeMultipartUpload(
        source,
        params,
      );

      const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
      let currentChunkIndex = 0;

      while (currentChunkIndex < totalChunks) {
        const start = currentChunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, fileSize);
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
          return { data: result.file! };
        }

        currentChunkIndex = result.nextChunkIndex ?? currentChunkIndex + 1;
      }

      throw new Error('Upload did not complete as expected');
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async regularUpload(
    source: string | File | Blob,
    params: {
      name?: string;
      size?: number;
      mimeType?: string;
      metadata?: ZenMetadata;
      projectId?: string | null;
      folderId?: string | null;
      abortController?: AbortController;
      onUploadProgress?: (percent: number) => void;
    },
  ): Promise<ZenResult<ZenFile>> {
    const formData = new FormData();
    formData.append('file', source);
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

    const headers: { [key: string]: string } = {};
    if (params.projectId) {
      headers['X-Project-Id'] = params.projectId;
    }
    if (params.folderId) {
      headers['X-Folder-Id'] = params.folderId;
    }

    return await this.axiosInstance
      .post('/files/upload', formData, {
        headers: headers,
        signal: params.abortController?.signal,
        onUploadProgress: (progress: AxiosProgressEvent) => {
          params.onUploadProgress?.((progress.progress ?? 0) * 100);
        },
      })
      .then((result) => {
        return { data: result.data };
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  private async initializeMultipartUpload(
    source: File | Blob,
    params: {
      name?: string;
      mimeType?: string;
      metadata?: ZenMetadata;
      projectId?: string | null;
      folderId?: string | null;
    },
  ): Promise<{ id: string }> {
    const headers: { [key: string]: string } = {};
    if (params.projectId) {
      headers['X-Project-Id'] = params.projectId;
    }
    if (params.folderId) {
      headers['X-Folder-Id'] = params.folderId;
    }

    const response = await this.axiosInstance.post(
      '/files/chunk-upload/initialize',
      {
        fileName:
          params.name || (source instanceof File ? source.name : 'file'),
        totalSize: source.size,
        mimeType:
          params.mimeType ||
          (source instanceof File ? source.type : 'application/octet-stream'),
        chunkSize: CHUNK_SIZE,
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

    const response = await this.axiosInstance.post(
      `/files/chunk-upload/part`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Chunk-Session-Id': sessionId,
          'Chunk-Size': chunk.size.toString(),
          'Chunk-Index': chunkIndex.toString(),
        },
        onUploadProgress,
      },
    );

    return {
      isComplete: response.data.isComplete,
      file: response.data.file,
      nextChunkIndex: response.data.nextChunkIndex,
    };
  }

  async listFiles(options?: {
    limit?: number;
    offset?: number;
  }): Promise<ZenResult<ZenList>> {
    return await this.axiosInstance
      .get(`/files`, {
        params: {
          limit: options?.limit ?? 20,
          offset: options?.offset ?? 0,
        },
      })
      .then((result) => {
        return { data: result.data };
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  async fileInfo(fileId: string): Promise<ZenResult<ZenFile>> {
    return await this.axiosInstance
      .get(`/files/${fileId}`)
      .then((result) => {
        return { data: result.data };
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  async updateFile(
    fileId: string,
    params: Partial<ZenFile>,
  ): Promise<ZenResult<ZenFile>> {
    return await this.axiosInstance
      .patch(`/files/${fileId}`, params)
      .then((result) => {
        return { data: result.data };
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  async deleteFile(fileId: string): Promise<ZenResult<boolean>> {
    return await this.axiosInstance
      .delete(`/files/${fileId}`)
      .then(() => {
        return { data: true };
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  async deleteFileByUrl(url: string): Promise<ZenResult<boolean>> {
    return await this.axiosInstance
      .delete(`/files/delete-by-url`, {
        params: {
          url: url,
        },
      })
      .then(() => {
        return { data: true };
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  private handleError(error: any): ZenResult<any> {
    return { error: this.transformError(error) };
  }

  private transformError(error: any): ZenError {
    if (error instanceof AxiosError && error.response?.data) {
      return {
        code: error.response.status,
        message: error.response.data?.message ?? error.response.statusText,
        cause: error.response.data,
      };
    }
    return {
      code: -1,
      message: 'Oops, something went wrong',
    };
  }
}
