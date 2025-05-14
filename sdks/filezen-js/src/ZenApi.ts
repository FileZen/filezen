import axios, { AxiosError, AxiosInstance, AxiosProgressEvent } from 'axios';
import { ZenError, ZenFile, ZenList, ZenMetadata, ZenResult } from './types';

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
      process.env.FILE_ZEN_API_KEY ??
      process.env.NEXT_PUBLIC_FILE_ZEN_API_KEY;
    if (!targetApiKey && !options.authorization) {
      throw new Error(
        "No API key provided, it's should be provided in options or via environment variable FILE_ZEN_API_KEY or NEXT_PUBLIC_FILEZEN_API_KEY",
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
      onUploadProgress?: (progress: AxiosProgressEvent) => void;
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
        onUploadProgress: (axiosProgress) => {
          params.onUploadProgress?.(axiosProgress);
        },
      })
      .then((result) => {
        return { data: result.data };
      })
      .catch(this.handleError);
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
      .catch(this.handleError);
  }

  async fileInfo(fileId: string): Promise<ZenResult<ZenFile>> {
    return await this.axiosInstance
      .get(`/files/${fileId}`)
      .then((result) => {
        return { data: result.data };
      })
      .catch(this.handleError);
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
      .catch(this.handleError);
  }

  async deleteFile(fileId: string): Promise<ZenResult<boolean>> {
    return await this.axiosInstance
      .delete(`/files/${fileId}`)
      .then(() => {
        return { data: true };
      })
      .catch(this.handleError);
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
      .catch(this.handleError);
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
