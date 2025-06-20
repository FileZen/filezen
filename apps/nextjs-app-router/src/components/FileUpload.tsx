'use client';

import { ZenError, ZenFile } from '@filezen/js';
import { useZenClient } from '@filezen/react';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export const FileUpload = () => {
  const zenClient = useZenClient();
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<ZenError | null>(null);
  const [uploadResult, setUploadResult] = React.useState<ZenFile | null>(null);

  const handleUpload = async (file: File) => {
    setError(null);
    setIsUploading(true);

    const result = await zenClient.upload(file);

    if (result.error) {
      setError(result.error);
      setIsUploading(false);
      return;
    }

    if (uploadResult) {
      zenClient.delete(uploadResult.id).then((result) => {
        if (result.error) {
          console.error('Previous file delete failed: ', result.error);
        } else {
          console.log('Previous file deleted!');
        }
      });
    }

    setUploadResult(result.file);
    setIsUploading(false);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleUpload(acceptedFiles[0]);
      }
    },
    [uploadResult],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="mx-auto w-full max-w-md p-4">
      <div className="space-y-4">
        <div className="text-lg font-medium text-gray-200">Profile Picture</div>

        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors duration-200 ease-in-out ${isDragActive ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-600 hover:border-indigo-400'} ${isUploading ? 'cursor-not-allowed opacity-50' : ''} `}
        >
          <input {...getInputProps()} disabled={isUploading} />

          {uploadResult ? (
            <div className="group relative">
              <img
                src={uploadResult.url}
                alt="Profile"
                className="mx-auto h-32 w-32 rounded-full object-cover ring-2 ring-gray-700"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/70 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-sm text-white">Click to change</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-gray-300">
                {isDragActive ? (
                  <span>Drop the image here</span>
                ) : (
                  <span>Drag & drop an image here, or click to select</span>
                )}
              </div>
              <div className="text-sm text-gray-400">PNG, JPG up to 5MB</div>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-md border border-red-800 bg-red-900/20 p-3 text-sm text-red-400">
            {error.message}
          </div>
        )}

        {isUploading && (
          <div className="flex items-center justify-center space-x-2 text-indigo-400">
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-indigo-400"></div>
            <span>Uploading...</span>
          </div>
        )}
      </div>
    </div>
  );
};
