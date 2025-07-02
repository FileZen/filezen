import {
  FinishMultipartUploadParams,
  MultipartUploadChunkParams,
  StartMultipartUploadParams,
  ZenStorageBulkItem,
  ZenStorageUploadOptions,
  ZenUploadSource,
} from './types';
import { ZenError } from './ZenError';
import { ZenStorageListener } from './ZenStorage';
import { ZenProgress, ZenUpload } from './ZenUpload';
import { ZenUploader } from './ZenUploader';

export type ZenUploaderProviderListener = {
  onUploadStart?: (file: ZenUpload) => void;
  onUploadProgress?: (file: ZenUpload, progress: ZenProgress) => void;
  onUploadComplete?: (file: ZenUpload) => void;
  onUploadError?: (file: ZenUpload, error: ZenError) => void;
  onUploadCancel?: (file: ZenUpload) => void;
  onUploadsChange?: (uploads: MapIterator<ZenUpload>) => void;
};

export abstract class ZenUploaderProvider<
  TListener extends ZenUploaderProviderListener,
> {
  private listeners: TListener[] = [];
  private uploads: Map<string, ZenUpload> = new Map<string, ZenUpload>();

  protected constructor() {}

  protected abstract getUploader(): ZenUploader;

  protected abstract isKeepingUploads(): boolean;

  addListener(listener: TListener) {
    this.listeners.push(listener);
  }

  removeListener(listener: TListener) {
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
    await Promise.all(zenUploads.map((upload) => upload.upload()));
    return zenUploads;
  }

  get multipart() {
    return {
      start: async (params: StartMultipartUploadParams) => {
        return this.getUploader().startMultipartUpload(params);
      },
      uploadPart: async (params: MultipartUploadChunkParams) => {
        return this.getUploader().uploadMultipartPart(params);
      },
      finish: async (params: FinishMultipartUploadParams) => {
        return this.getUploader().finishMultipartUpload(params);
      },
    };
  }

  buildUpload(
    source: ZenUploadSource,
    options?: ZenStorageUploadOptions,
  ): ZenUpload {
    const zenUpload: ZenUpload = this.getUploader().buildUpload(
      source,
      options,
    );

    // Only store uploads if keepUploads is true (default) or not explicitly set to false
    if (this.isKeepingUploads()) {
      this.uploads.set(zenUpload.localId, zenUpload);
      this.listeners.forEach((listener: ZenStorageListener) => {
        listener.onUploadsChange?.(this.uploads.values());
      });
    }

    zenUpload.addListener({
      onStart: (upload) => {
        this.listeners.forEach((l) => l.onUploadStart?.(upload));
      },
      onProgress: (upload, progress) => {
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
        if (this.isKeepingUploads() && this.uploads.has(upload.localId)) {
          this.uploads.delete(upload.localId);
          this.listeners.forEach((l) => {
            l.onUploadsChange?.(this.uploads.values());
          });
        }
      },
    });
    return zenUpload;
  }
}
