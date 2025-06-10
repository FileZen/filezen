'use client';

import { useFileZen } from '@filezen/react';
import { useState, useRef } from 'react';

export function BulkUploadDemo() {
  const { bulkUpload } = useFileZen();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      const uploads = selectedFiles.map(file => ({
        source: file,
        options: {}
      }));
      
      await bulkUpload(...uploads);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          className="flex-1 rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white file:mr-2 file:rounded file:border-0 file:bg-blue-600 file:px-2 file:py-1 file:text-white file:hover:bg-blue-700"
        />
        
        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isUploading}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
        
        <button
          onClick={handleClear}
          disabled={selectedFiles.length === 0}
          className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Clear
        </button>
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="rounded bg-gray-700 p-3">
          <h4 className="mb-2 text-sm font-semibold text-white">
            Selected Files ({selectedFiles.length}):
          </h4>
          <div className="max-h-32 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex justify-between text-xs text-gray-300">
                <span className="truncate">{file.name}</span>
                <span className="ml-2 text-gray-400">{formatFileSize(file.size)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="rounded bg-gray-700 p-3">
        <h4 className="mb-2 text-sm font-semibold text-white">Code Example:</h4>
        <code className="text-xs text-gray-300">
          {`const { bulkUpload } = useFileZen();

const uploads = files.map(file => ({
  source: file,
  options: {}
}));

await bulkUpload(...uploads);`}
        </code>
      </div>
    </div>
  );
} 