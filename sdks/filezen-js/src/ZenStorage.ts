import {
  ZenStorageBulkItem,
  ZenStorageSource,
  ZenStorageUploadOptions,
} from './types';
import { ZenApi, ZenApiOptions } from './ZenApi';
import { ZenError } from './ZenError';
import { ZenUpload } from './ZenUpload';

export type ZenStorageOptions = ZenApiOptions & {};

export type ZenStorageListener = {
  onUploadStart?: (file: ZenUpload) => void;
  onUploadProgress?: (file: ZenUpload, progress: number) => void;
  onUploadComplete?: (file: ZenUpload) => void;
  onUploadError?: (file: ZenUpload, error: ZenError) => void;
  onUploadCancel?: (file: ZenUpload) => void;
  onUploadsChange?: (uploads: MapIterator<ZenUpload>) => void;
};

export class ZenStorage {
  readonly api: ZenApi;

  private listeners: ZenStorageListener[] = [];
  private uploads: Map<string, ZenUpload> = new Map<string, ZenUpload>();

  constructor(readonly options: ZenStorageOptions = {}) {
    this.api = new ZenApi(options);
  }

  addListener(listener: ZenStorageListener) {
    this.listeners.push(listener);
  }

  removeListener(listener: ZenStorageListener) {
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
    source: ZenStorageSource,
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
    source: ZenStorageSource,
    options?: ZenStorageUploadOptions,
  ): ZenUpload {
    let zenUpload: ZenUpload;
    if (source instanceof File) {
      zenUpload = ZenUpload.fromFile(this.api.uploader, source, {
        folder: options?.folder,
        folderId: options?.folderId,
        projectId: options?.projectId,
      });
    } else if (source instanceof Blob) {
      throw new Error('Blob not implemented');
    } else {
      throw new Error('String not implemented');
    }
    this.uploads.set(zenUpload.localId, zenUpload);
    this.listeners.forEach((listener: ZenStorageListener) => {
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

  deleteByUrl(url: string) {
    return this.api.deleteFileByUrl(url);
  }
}
