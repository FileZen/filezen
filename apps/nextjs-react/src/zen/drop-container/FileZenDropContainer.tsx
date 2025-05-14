'use client';

import { FileZenContext } from '@filezen/react';
import * as React from 'react';
import { DragEvent, useContext, useState } from 'react';

type AppGlobalDropContainerProps = React.ComponentPropsWithoutRef<'div'>;

export const FileZenDropContainer = (props: AppGlobalDropContainerProps) => {
  const { children, className } = props;
  const { storage, upload } = useContext(FileZenContext);
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
    upload(
      ...files.map((file) => {
        return storage.buildUpload(file);
      }),
    );
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
      {isDraggedOver && (
        <div
          className={
            'absolute top-0 left-0 z-10 h-full w-full bg-white/90 p-12'
          }
        >
          <div className={'h-full w-full rounded-lg border-2 border-dashed'} />
        </div>
      )}
      {children}
    </div>
  );
};
