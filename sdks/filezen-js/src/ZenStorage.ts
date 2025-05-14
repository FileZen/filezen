import { ZenError } from './types';
import { ZenUpload } from './ZenUpload';
import { ZenApi, ZenApiOptions } from './ZenApi';

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

  async upload(
    source: File | Blob | string,
    options?: {
      name?: string;
      folder?: string;
      folderId?: string;
    },
  ): Promise<ZenUpload> {
    let upload: ZenUpload;
    if (source instanceof File) {
      upload = this.buildUpload(source, options);
    } else if (source instanceof Blob) {
      throw new Error('Blob not implemented');
    } else {
      throw new Error('String not implemented');
    }
    await upload.upload();
    return upload;
  }

  buildUpload(
    source: File | Blob | string,
    options?: {
      name?: string;
      folder?: string;
      folderId?: string;
      projectId?: string | null;
    },
  ): ZenUpload {
    let upload: ZenUpload;
    if (source instanceof File) {
      upload = ZenUpload.fromFile(this, source, {
        folder: options?.folder,
        folderId: options?.folderId,
        projectId: options?.projectId,
      });
    } else if (source instanceof Blob) {
      throw new Error('Blob not implemented');
    } else {
      throw new Error('String not implemented');
    }
    this.uploads.set(upload.localId, upload);
    this.listeners.forEach((listener: ZenStorageListener) => {
      listener.onUploadsChange?.(this.uploads.values());
    });
    upload.addListener({
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
    return upload;
  }
}
