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

export type ZenStorageSource = File | Blob | Buffer | string;

export type ZenUploadSource = File | Blob | string;

export type ZenStorageUploadOptions = {
  name?: string;
  folder?: string;
  folderId?: string;
  projectId?: string | null;
  mimeType?: string;
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
  projectId?: string | null;
  folderId?: string | null;
  abortController?: AbortController;
  onUploadProgress?: (percent: number) => void;
};
