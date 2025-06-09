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
  cdnUrl?: string;
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

export type ZenError = {
  code: number;
  message: string;
  cause?: any;
};

export type ZenResult<T> = {
  data?: T;
  error?: ZenError;
};

export type ZenStorageSource = File | Blob | string;

export type ZenStorageUploadOptions = {
  name?: string;
  folder?: string;
  folderId?: string;
  projectId?: string | null;
};

export type ZenStorageBulkObject = {
  source: ZenStorageSource;
  options?: ZenStorageUploadOptions;
};
