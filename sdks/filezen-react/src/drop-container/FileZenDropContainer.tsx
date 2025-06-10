'use client';

import { ZenStorageBulkItem } from '@filezen/js';
import * as React from 'react';
import { DragEvent, useContext, useState } from 'react';
import { FileZenContext } from '../index';

type AppGlobalDropContainerProps = React.ComponentPropsWithoutRef<'div'> & {
  children: React.ReactElement | ((isDraggedOver: boolean) => React.ReactNode);
};

export const FileZenDropContainer = (props: AppGlobalDropContainerProps) => {
  const { children, className } = props;
  const { bulkUpload } = useContext(FileZenContext);
  const [isDraggedOver, setDraggedOver] = useState(false);
  const handleDrop = (event: DragEvent<any>) => {
    event.preventDefault();
    setDraggedOver(false);

    const files: File[] = [];
    if (event.dataTransfer.items) {
      [...event.dataTransfer.items].forEach((item, i) => {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      });
    } else {
      [...event.dataTransfer.files].forEach((file, i) => {
        files.push(file);
      });
    }
    const bulkObjects: ZenStorageBulkItem[] = files.map((file) => {
      return { source: file };
    });
    bulkUpload(...bulkObjects);
  };
  return (
    <div
      className={`pointer-events-auto h-full w-full ${className || ''}`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDraggedOver(true);
      }}
      onDragExit={() => {
        setDraggedOver(false);
      }}
      onDragLeave={() => {
        setDraggedOver(false);
      }}
      onDragEnd={() => {
        setDraggedOver(false);
      }}
    >
      {typeof children === 'function' 
        ? children(isDraggedOver)
        : React.isValidElement(children)
        ? React.cloneElement(children, { isDraggedOver } as any)
        : children}
    </div>
  );
};
