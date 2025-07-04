import { AxiosProgressEvent } from 'axios';
import { ZenProgress, ZenUploadListener } from './ZenUpload';

/*
Api
 */

export enum FileType {
  file = 'file',
  folder = 'folder',
}

export enum FileState {
  deleting = 'deleting',
  uploading = 'uploading',
  completed = 'completed',
}

export type ZenProject = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  organisationId: string;
  region: string;
};

export type ZenMetadata = {
  [key: string]: any;
};

export type ZenFile = {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: FileType;
  state: FileState;
  name: string;
  mimeType: string;
  size: number;
  region: string;
  url?: string;
  projectId: string;
  project: ZenProject;
  parentId?: string;
  parent?: ZenFile;
  metadata?: ZenMetadata;
};

export type ZenList = {
  data: ZenFile[];
  page: number;
  pageCount: number;
  count: number;
  total: number;
};

/*
Uploader & Storage
 */

export type ZenUploadSource = File | Blob | Buffer | string;

export type ZenStorageUploadOptions = {
  name?: string;
  folder?: string;
  folderId?: string;
  projectId?: string | null;
  mimeType?: string;
  metadata?: ZenMetadata;
  listener?: ZenUploadListener;
};

export type ZenStorageBulkItem = {
  source: ZenUploadSource;
  options?: ZenStorageUploadOptions;
};

export type ZenUploaderParams = {
  name?: string;
  size?: number;
  mimeType?: string;
  metadata?: ZenMetadata;
  folderId?: string | null;
  projectId?: string | null;
  abortController?: AbortController;
  onUploadProgress?: (progress: ZenProgress) => void;
};

/*
Multipart
 */

export enum UploadMode {
  CHUNKED = 'chunked', // Known file size, sequential chunks
  STREAMING = 'streaming', // Unknown file size, any order chunks
}

export type StartMultipartUploadParams = {
  fileName: string;
  mimeType: string;
  totalSize?: number;
  chunkSize?: number;
  metadata?: ZenMetadata;
  uploadMode?: UploadMode;
  parentId?: string | null;
  projectId?: string | null;
};

export type MultipartUploadChunkParams = {
  sessionId: string;
  chunk: Blob;
  chunkIndex?: number;
  abortController?: AbortController;
  onUploadProgress?: (progress: AxiosProgressEvent) => void;
};

export type MultipartChunkUploadResult = {
  isComplete: boolean;
  file?: ZenFile;
  nextChunkIndex?: number;
};

export type FinishMultipartUploadParams = {
  sessionId: string;
  abortController?: AbortController;
};
