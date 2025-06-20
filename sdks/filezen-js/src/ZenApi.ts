import axios, { AxiosInstance } from 'axios';
import { DEFAULT_API_URL } from './constants';
import { ZenFile, ZenList, ZenUploadSource, ZenUploaderParams } from './types';
import {
  buildZenErrorResult,
  buildZenSuccessResult,
  ZenResult,
} from './ZenResult';
import { ZenUploader } from './ZenUploader';

export type ZenApiOptions = {
  apiKey?: string;
  apiUrl?: string;
};

export class ZenApi {
  readonly apiKey: string;
  readonly apiUrl: string;
  readonly uploader: ZenUploader;

  private readonly axiosInstance: AxiosInstance;

  constructor(readonly options: ZenApiOptions = {}) {
    const targetApiKey =
      options.apiKey ??
      process.env.FILEZEN_API_KEY ??
      process.env.REACT_APP_FILEZEN_API_KEY ??
      process.env.NEXT_PUBLIC_FILEZEN_API_KEY;
    if (!targetApiKey) {
      throw new Error(
        "No API key provided, it's should be provided in options or via environment variable FILEZEN_API_KEY or NEXT_PUBLIC_FILEZEN_API_KEY or REACT_APP_FILEZEN_API_KEY",
      );
    }
    this.apiKey = targetApiKey;
    this.apiUrl = options.apiUrl ?? DEFAULT_API_URL;
    const headers: { [key: string]: string | number } = {
      ApiKey: targetApiKey,
    };
    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      headers: headers,
    });
    this.uploader = new ZenUploader({ url: this.apiUrl, headers: headers });
  }

  setAuthorization(authorization?: string | null | undefined) {
    this.axiosInstance.defaults.headers['Authorization'] =
      authorization ?? null;
  }

  async uploadFile(
    source: ZenUploadSource,
    params: ZenUploaderParams,
  ): Promise<ZenResult<ZenFile>> {
    return this.uploader.uploadFile(source, params);
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
        return buildZenSuccessResult(result.data);
      })
      .catch((error) => {
        return buildZenErrorResult(error);
      });
  }

  async fileInfo(fileId: string): Promise<ZenResult<ZenFile>> {
    return await this.axiosInstance
      .get(`/files/${fileId}`)
      .then((result) => {
        return { data: result.data };
      })
      .catch((error) => {
        return buildZenErrorResult(error);
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
        return buildZenErrorResult(error);
      });
  }

  async deleteFile(fileId: string): Promise<ZenResult<boolean>> {
    return await this.axiosInstance
      .delete(`/files/${fileId}`)
      .then(() => {
        return { data: true };
      })
      .catch((error) => {
        return buildZenErrorResult(error);
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
        return buildZenSuccessResult(true);
      })
      .catch((error) => {
        return buildZenErrorResult(error);
      });
  }
}
