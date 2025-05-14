'use client';

import { ZenError, ZenFile, ZenStorage } from '@filezen/js';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const fileZen = new ZenStorage({
  apiUrl: 'http://localhost:3000',
});

export const AvatarUpload = () => {
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<ZenError | null>(null);
  const [uploadResult, setUploadResult] = React.useState<ZenFile | null>(null);

  const handleUpload = async (file: File) => {
    setError(null);
    setIsUploading(true);
    try {
      const result = await fileZen.upload(file);
      if (result.error) {
        setError(result.error);
      } else {
        setUploadResult(result.file);
      }
    } catch (err) {
      setError(err as ZenError);
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleUpload(acceptedFiles[0]);
    }
  }, []);

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
    <div className="w-full max-w-md mx-auto p-4">
      <div className="space-y-4">
        <div className="text-lg font-medium text-gray-200">Profile Picture</div>
        
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors duration-200 ease-in-out
            ${isDragActive ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-600 hover:border-indigo-400'}
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} disabled={isUploading} />
          
          {uploadResult ? (
            <div className="relative group">
              <img
                src={uploadResult.url}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover mx-auto ring-2 ring-gray-700"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-sm">Click to change</span>
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
              <div className="text-sm text-gray-400">
                PNG, JPG up to 5MB
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-md border border-red-800">
            {error.message}
          </div>
        )}

        {isUploading && (
          <div className="flex items-center justify-center space-x-2 text-indigo-400">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-400"></div>
            <span>Uploading...</span>
          </div>
        )}
      </div>
    </div>
  );
};
