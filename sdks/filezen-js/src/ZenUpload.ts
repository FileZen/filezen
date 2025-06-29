import { v4 } from 'uuid';
import { ZenFile, ZenMetadata } from './types';
import { ZenError } from './ZenError';
import { ZenUploader } from './ZenUploader';

export interface ZenUploadListener {
  onStart?: (upload: ZenUpload) => void;
  onProgress?: (upload: ZenUpload, progress: number) => void;
  onComplete?: (upload: ZenUpload) => void;
  onError?: (upload: ZenUpload, error: ZenError) => void;
  onCancel?: (upload: ZenUpload) => void;
}

export class ZenUpload {
  readonly localId: string = v4();

  private listeners: ZenUploadListener[] = [];
  private abortController?: AbortController;

  private _progressPercent: number = 0;
  private _error: ZenError | null | undefined;
  private _isCompleted: boolean = false;
  private _file: ZenFile | null = null;

  static fromFile(
    uploader: ZenUploader,
    file: File,
    options?: {
      folder?: string | null;
      folderId?: string | null;
      projectId?: string | null;
    },
  ): ZenUpload {
    const fileName = options?.folder
      ? `${options.folder}/${file.name}`
      : file.name;
    return new ZenUpload(
      uploader,
      fileName,
      file.type,
      file,
      undefined,
      options?.projectId,
      options?.folderId,
    );
  }

  static fromBlob(
    uploader: ZenUploader,
    source: Blob,
    options: {
      name: string;
      mimeType?: string;
      folder?: string | null;
      folderId?: string | null;
      projectId?: string | null;
    },
  ): ZenUpload {
    const fileName = options.folder
      ? `${options.folder}/${options.name}`
      : options.name;
    return new ZenUpload(
      uploader,
      fileName,
      options.mimeType ?? 'application/octet-stream',
      new Blob([source], {
        type: options.mimeType ?? 'application/octet-stream',
      }),
      undefined,
      options.projectId,
      options.folderId,
    );
  }

  static fromBuffer(
    uploader: ZenUploader,
    source: Buffer,
    options: {
      name: string;
      mimeType?: string;
      folder?: string | null;
      folderId?: string | null;
      projectId?: string | null;
    },
  ): ZenUpload {
    const fileName = options.folder
      ? `${options.folder}/${options.name}`
      : options.name;
    return new ZenUpload(
      uploader,
      fileName,
      options.mimeType ?? 'application/octet-stream',
      new Blob([source], {
        type: options.mimeType ?? 'application/octet-stream',
      }),
      undefined,
      options.projectId,
      options.folderId,
    );
  }

  constructor(
    readonly uploader: ZenUploader,
    readonly name: string,
    readonly type: string,
    readonly source: File | Blob | string,
    readonly metadata?: ZenMetadata,
    readonly projectId?: string | null,
    readonly folderId?: string | null,
  ) {}

  addListener(listener: ZenUploadListener): void {
    if (!this.listeners.includes(listener)) {
      this.listeners.push(listener);
    }
  }

  removeListener(listener: ZenUploadListener): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  notifyStart() {
    this.listeners.forEach((listener: ZenUploadListener) => {
      listener.onStart?.(this);
    });
  }

  set progressPercent(progress: number) {
    this._progressPercent = progress;
    this.listeners.forEach((listener: ZenUploadListener) => {
      listener.onProgress?.(this, progress);
    });
  }

  get progressPercent() {
    return this._progressPercent;
  }

  set error(error: ZenError | null | undefined) {
    this._error = error;
    if (error) {
      this.listeners.forEach((listener: ZenUploadListener) => {
        listener.onError?.(this, error);
      });
    }
  }

  get error() {
    return this._error;
  }

  set isCompleted(completed: boolean) {
    this._isCompleted = completed;
    if (completed) {
      this.listeners.forEach((listener: ZenUploadListener) => {
        listener.onComplete?.(this);
      });
    }
  }

  get isCompleted() {
    return this._isCompleted;
  }

  get file() {
    return this._file;
  }

  async upload(): Promise<ZenUpload> {
    const controller = new AbortController();
    this.abortController = controller;

    this.error = null;
    this.notifyStart();

    const result = await this.uploader.uploadFile(this.source, {
      name: this.name,
      mimeType: this.type,
      metadata: this.metadata,
      projectId: this.projectId,
      folderId: this.folderId,
      abortController: controller,
      onUploadProgress: (percent) => {
        this.progressPercent = percent;
        this.listeners.forEach((listener) => {
          listener.onProgress?.(this, percent);
        });
      },
    });

    if (result.data) {
      this._file = result.data;
      this.isCompleted = true;
      this.listeners.forEach((listener) => {
        listener.onComplete?.(this);
      });
    } else {
      this.error = result.error!;
      this.listeners.forEach((listener) => {
        listener.onError?.(this, this.error!);
      });
    }
    return this;
  }

  cancel() {
    if (!this.abortController) {
      return;
    }
    this.abortController.abort();
    this.abortController = undefined;
    this.listeners.forEach((listener) => {
      listener.onCancel?.(this);
    });
  }
}
