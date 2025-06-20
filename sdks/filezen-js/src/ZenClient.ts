import axios from 'axios';
import { DEFAULT_SIGN_URL } from './constants';
import {
  ZenStorageBulkItem,
  ZenStorageUploadOptions,
  ZenUploadSource,
} from './types';
import { ZenError } from './ZenError';
import {
  buildZenErrorResult,
  buildZenSuccessResult,
  ZenResult,
} from './ZenResult';
import { ZenUpload } from './ZenUpload';
import { ZenUploader } from './ZenUploader';

export type ZenClientListener = {
  onUploadStart?: (file: ZenUpload) => void;
  onUploadProgress?: (file: ZenUpload, progress: number) => void;
  onUploadComplete?: (file: ZenUpload) => void;
  onUploadError?: (file: ZenUpload, error: ZenError) => void;
  onUploadCancel?: (file: ZenUpload) => void;
  onUploadsChange?: (uploads: MapIterator<ZenUpload>) => void;
};

export type ZenClientOptions = {
  url?: string;
  signUrl: string;
};

export class ZenClient {
  private readonly uploader: ZenUploader;

  private listeners: ZenClientListener[] = [];
  private uploads: Map<string, ZenUpload> = new Map<string, ZenUpload>();

  constructor(
    private readonly options: ZenClientOptions = {
      signUrl: DEFAULT_SIGN_URL,
    },
  ) {
    this.uploader = new ZenUploader(options);
  }

  addListener(listener: ZenClientListener) {
    this.listeners.push(listener);
  }

  removeListener(listener: ZenClientListener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  get getUploads() {
    return this.uploads.values();
  }

  get activeUploads() {
    return Array.from(this.uploads.values()).filter(
      (upload) => !upload.error && !upload.isCompleted,
    );
  }

  async upload(
    source: ZenUploadSource,
    options?: ZenStorageUploadOptions,
  ): Promise<ZenUpload> {
    const zenUpload: ZenUpload = this.buildUpload(source, options);
    await zenUpload.upload();
    return zenUpload;
  }

  async bulkUpload(...uploads: ZenStorageBulkItem[]) {
    const zenUploads = uploads.map((upload) =>
      this.buildUpload(upload.source, upload.options),
    );
    await Promise.all(zenUploads);
    return zenUploads;
  }

  buildUpload(
    source: ZenUploadSource,
    options?: ZenStorageUploadOptions,
  ): ZenUpload {
    const zenUpload: ZenUpload = this.uploader.buildUpload(source, options);
    this.uploads.set(zenUpload.localId, zenUpload);
    this.listeners.forEach((listener: ZenClientListener) => {
      listener.onUploadsChange?.(this.uploads.values());
    });
    zenUpload.addListener({
      onStart: (upload) => {
        this.listeners.forEach((l) => l.onUploadStart?.(upload));
      },
      onProgress: (upload, progress: number) => {
        this.listeners.forEach((l) => l.onUploadProgress?.(upload, progress));
      },
      onComplete: (upload) => {
        this.listeners.forEach((l) => l.onUploadComplete?.(upload));
      },
      onError: (upload, error) => {
        this.listeners.forEach((l) => l.onUploadError?.(upload, error));
      },
      onCancel: (upload) => {
        this.listeners.forEach((l) => l.onUploadCancel?.(upload));
        if (this.uploads.has(upload.localId)) {
          this.uploads.delete(upload.localId);
          this.listeners.forEach((l) => {
            l.onUploadsChange?.(this.uploads.values());
          });
        }
      },
    });
    return zenUpload;
  }

  async delete(urlOrId: string): Promise<ZenResult<boolean>> {
    return await axios
      .delete<{ success: boolean }>(this.options.signUrl, {
        params: {
          urlOrId: urlOrId,
        },
      })
      .then((result) => {
        return buildZenSuccessResult(result.data.success);
      })
      .catch((error) => {
        return buildZenErrorResult(error);
      });
  }
}
