'use client';

import { ZenError, ZenFile } from '@filezen/js';
import { useFileZen } from '@filezen/react';
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export function DragDropDemo() {
  const { storage } = useFileZen();
  const [dragCount, setDragCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<ZenError | null>(null);
  const [uploadResult, setUploadResult] = useState<ZenFile | null>(null);

  const handleUpload = async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      const upload = storage.buildUpload(file, {});
      await upload.upload();

      if (uploadResult) {
        // Delete previous file if exists
        try {
          await storage.api.deleteFile(uploadResult.id);
          console.log('Previous file deleted!');
        } catch (deleteError) {
          console.error('Previous file delete failed: ', deleteError);
        }
      }

      setUploadResult(upload.file);
    } catch (uploadError) {
      if (uploadError instanceof ZenError) {
        setError(uploadError);
      } else if (uploadError instanceof Error) {
        setError(new ZenError(-1, uploadError.message));
      } else {
        setError(new ZenError(-1, 'Upload failed'));
      }
      console.error('Upload failed:', uploadError);
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleUpload(acceptedFiles[0]);
        setDragCount((prev) => prev + 1);
      }
    },
    [uploadResult],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      '*/*': [], // Accept all file types
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`flex h-32 items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer ${
          isDragActive
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600'
        } ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <input {...getInputProps()} disabled={isUploading} />
        
        <div className="text-center">
          {uploadResult ? (
            <div className="group relative">
              <img
                src={uploadResult.url}
                alt="Uploaded file"
                className="mx-auto h-20 w-20 rounded object-cover ring-2 ring-gray-700"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded bg-black/70 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-xs text-white">Click to change</span>
              </div>
            </div>
          ) : (
            <>
              <svg
                className={`mx-auto h-8 w-8 transition-colors ${
                  isDragActive ? 'text-blue-400' : 'text-gray-400'
                }`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p
                className={`mt-2 text-sm transition-colors ${
                  isDragActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300'
                }`}
              >
                {isDragActive ? 'Drop files here!' : 'Drag and drop files here'}
              </p>
              <p className="text-xs text-gray-400">Files dropped: {dragCount}</p>
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-md border border-red-800 bg-red-900/20 p-3 text-sm text-red-400">
          {error.message}
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="flex items-center justify-center space-x-2 text-blue-400">
          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-400"></div>
          <span>Uploading...</span>
        </div>
      )}

      <div className="rounded bg-gray-700 p-3">
        <h4 className="mb-2 text-sm font-semibold text-white">Code Example:</h4>
        <code className="text-xs text-gray-300">
          {`import { useFileZen } from '@filezen/react';
import { useDropzone } from 'react-dropzone';

const { storage } = useFileZen(); // Access ZenStorage instance

const handleUpload = async (file: File) => {
  const upload = storage.buildUpload(file, {});
  const result = await upload.upload();
  console.log('Uploaded:', result.url);
};

const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop: (files) => handleUpload(files[0]),
  maxFiles: 1,
});

<div {...getRootProps()}>
  <input {...getInputProps()} />
  {isDragActive ? 'Drop files here!' : 'Drag files here'}
</div>`}
        </code>
      </div>
    </div>
  );
}
