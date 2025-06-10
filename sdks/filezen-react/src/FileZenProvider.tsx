'use client';

import {
  ZenStorage,
  ZenStorageBulkItem,
  ZenStorageListener,
  ZenStorageSource,
  ZenStorageUploadOptions,
  ZenUpload,
  ZenUploadListener,
} from '@filezen/js';
import React, {
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

export type FileZenProviderPickerOptions = {
  folder?: string;
  folderId?: string;
  accept?: string;
  multiple?: boolean;
};

export interface IFileZenContext {
  storage: ZenStorage;
  setProjectId: (projectId?: string | null) => void;
  getProjectId: () => string | null | undefined;
  setFolderId: (folderId?: string | null) => void;
  getFolderId: () => string | null | undefined;
  setAuthorisation: (authorisation?: string | null) => void;

  get uploads(): ZenUpload[];

  activeUploads: ZenUpload[];
  upload: (
    source: ZenStorageSource,
    options?: ZenStorageUploadOptions,
  ) => Promise<ZenUpload>;
  bulkUpload: (...uploads: ZenStorageBulkItem[]) => Promise<ZenUpload[]>;
  cancel: (upload: ZenUpload) => void;
  addListener: (listener: ZenStorageListener) => void;
  removeListener: (listener: ZenStorageListener) => void;
  openPicker: (options?: FileZenProviderPickerOptions) => void;
}

export const FileZenContext = React.createContext<IFileZenContext>({} as any);

export type FileZenProviderProps = PropsWithChildren & {
  apiKey?: string;
  apiUrl?: string;
  authorization?: string;
};

export const FileZenProvider = (props: FileZenProviderProps) => {
  const { apiKey, apiUrl, authorization, children } = props;
  const [projectId, setProjectId] = React.useState<string | null | undefined>(
    null,
  );
  const [folderId, setFolderId] = React.useState<string | null | undefined>(
    null,
  );
  const [activeUploads, setActiveUploads] = useState<ZenUpload[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storage = useMemo(() => {
    return new ZenStorage({
      apiKey: apiKey,
      apiUrl: apiUrl,
      authorization: authorization,
    });
  }, [apiKey, apiUrl, authorization]);

  const uploadListener = useMemo(() => {
    const listener: ZenUploadListener = {};
    listener.onComplete = (upload: ZenUpload) => {
      upload.removeListener(listener);
      setActiveUploads((prevState) => prevState.filter((e) => e !== upload));
    };
    return listener;
  }, [setActiveUploads]);

  const handleUpload = useCallback(
    (...data: ZenStorageBulkItem[]) => {
      console.log('handleUpload', data);
      const uploads = data.map((source) => {
        return storage.buildUpload(source.source, source.options);
      });
      uploads.forEach((upload) => {
        upload.addListener(uploadListener);
      });
      setActiveUploads((prev) => [...prev, ...uploads]);
      return Promise.all(
        uploads.map((upload) => {
          return upload.upload();
        }),
      );
    },
    [storage, uploadListener, setActiveUploads],
  );

  const handleFileSelect =
    (options?: FileZenProviderPickerOptions) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        const uploads: ZenStorageBulkItem[] = Array.from(files).map(
          (file) => {
            return {
              source: file,
              options: { ...options, projectId: projectId },
            };
          },
        );
        handleUpload(...uploads);
        // Reset the input value so the same file can be selected again
        event.target.value = '';
      }
    };

  return (
    <FileZenContext.Provider
      value={{
        storage: storage,
        setProjectId: (projectId) => {
          setProjectId(projectId);
        },
        getProjectId: () => {
          return projectId;
        },
        setFolderId: (folderId) => {
          setFolderId(folderId);
        },
        getFolderId: () => {
          return folderId;
        },
        setAuthorisation: (value) => {
          storage.api.setAuthorization(value);
        },
        activeUploads: activeUploads,
        get uploads() {
          return Array.from(storage.getUploads);
        },
        upload: async (source, options) => {
          return await handleUpload({ source, options }).then((res) => res[0]!);
        },
        bulkUpload: async (...uploads: ZenStorageBulkItem[]) => {
          return handleUpload(...uploads);
        },
        cancel: (upload) => {
          upload.cancel();
          upload.removeListener(uploadListener);
          setActiveUploads((prev) => prev.filter((i) => i !== upload));
        },
        addListener: (listener) => {
          storage.addListener(listener);
        },
        removeListener: (listener) => {
          storage.removeListener(listener);
        },
        openPicker: (options) => {
          if (fileInputRef.current) {
            // Set attributes directly on the input element
            if (options) {
              if (options.accept !== undefined) {
                fileInputRef.current.accept = options.accept;
              }
              if (options.multiple !== undefined) {
                fileInputRef.current.multiple = options.multiple;
              }
            } else {
              // Reset to defaults if no options provided
              fileInputRef.current.accept = '*/*';
              fileInputRef.current.multiple = true;
            }
            fileInputRef.current.onchange = handleFileSelect(options) as any;
            fileInputRef.current.click();
          }
        },
      }}
    >
      <input
        key={'filezen-file-picker'}
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      {children}
    </FileZenContext.Provider>
  );
};

export function useFileZen() {
  return useContext(FileZenContext);
}
