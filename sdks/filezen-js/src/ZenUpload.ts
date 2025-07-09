import {
  ZenFile,
  ZenMetadata,
  ZenStorageUploadOptions,
  ZenUploadSource,
} from './types';
import { extractFileInfoFromUrl, getMimeTypeFromName } from './utils';
import { ZenError } from './ZenError';
import { ZenUploader } from './ZenUploader';

export type ZenProgress = {
  bytes?: number;
  total?: number;
  percent?: number;
};

export interface ZenUploadListener {
  onStart?: (upload: ZenUpload) => void;
  onProgress?: (upload: ZenUpload, progress: ZenProgress) => void;
  onComplete?: (upload: ZenUpload) => void;
  onError?: (upload: ZenUpload, error: ZenError) => void;
  onCancel?: (upload: ZenUpload) => void;
}

let lastUsedId = 0;
const genUploadId = () => {
  return `${++lastUsedId}-${Date.now()}`;
};

export class ZenUpload {
  readonly localId: string = genUploadId();

  private listeners: ZenUploadListener[] = [];
  private abortController?: AbortController;

  private _progress: ZenProgress = { bytes: 0, percent: 0 };
  private _error: ZenError | null | undefined;
  private _isCompleted: boolean = false;
  private _file: ZenFile | null = null;

  static fromSource(
    uploader: ZenUploader,
    source: ZenUploadSource,
    options?: ZenStorageUploadOptions,
  ): ZenUpload {
    let targetName: string | undefined = options?.name;
    let targetMimeType = options?.mimeType;
    if (source instanceof File && !targetName) {
      targetName = source.name;
    }
    if (!targetName && typeof source === 'string') {
      let fileInfo = extractFileInfoFromUrl(source);
      if (fileInfo) {
        targetName = fileInfo.filename;
        if (fileInfo.mimeType) {
          targetMimeType = fileInfo.mimeType;
        }
      }
      //TODO: add extract from base64
    }
    if (!targetName) {
      throw new Error('`name` is required for upload sources other than File');
    }
    if (!targetMimeType) {
      targetMimeType =
        getMimeTypeFromName(targetName) ?? 'application/octet-stream';
    }
    const resultFileName = options?.folder
      ? `${options.folder}/${targetName}`
      : targetName;
    const result = new ZenUpload(
      uploader,
      resultFileName,
      targetMimeType,
      source,
      options?.metadata,
      options?.projectId,
      options?.folderId,
    );
    if (options?.listener) {
      result.addListener(options.listener);
    }
    return result;
  }

  private constructor(
    readonly uploader: ZenUploader,
    readonly name: string,
    readonly type: string,
    readonly source: ZenUploadSource,
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

  set progress(progress: ZenProgress) {
    this._progress = progress;
  }

  get progress() {
    return this._progress;
  }

  set error(error: ZenError | null | undefined) {
    this._error = error;
  }

  get error() {
    return this._error;
  }

  set isCompleted(completed: boolean) {
    this._isCompleted = completed;
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
    this.listeners.forEach((listener: ZenUploadListener) => {
      listener.onStart?.(this);
    });

    const result = await this.uploader.uploadFile(this.source, {
      name: this.name,
      mimeType: this.type,
      metadata: this.metadata,
      projectId: this.projectId,
      folderId: this.folderId,
      abortController: controller,
      onUploadProgress: (percent) => {
        this.progress = percent;
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
