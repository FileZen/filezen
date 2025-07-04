'use client';

import {
  MULTIPART_CHUNK_SIZE,
  UploadMode,
  ZenError,
  ZenFile,
} from '@filezen/js';
import { useZenClient } from '@filezen/react';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export const CustomMultipartUpload = () => {
  const zenClient = useZenClient();
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<ZenError | null>(null);
  const [uploadResult, setUploadResult] = React.useState<ZenFile | null>(null);

  /**
   * Handle multipart file upload to FileZen
   * This implements a custom chunked upload process for large files
   *
   * Multipart Upload Process:
   * 1. Initialize upload session with file metadata
   * 2. Split file into chunks and upload sequentially
   * 3. Finalize the upload session to complete the file
   * 4. Clean up any previous uploaded files
   * 5. Update UI state with results
   *
   * @param file - The File object to upload
   */
  const handleUpload = async (file: File) => {
    // Reset error state and indicate upload is starting
    setError(null);
    setIsUploading(true);

    try {
      // STEP 1: Initialize multipart upload session
      // This creates a session on FileZen servers and returns a sessionId
      // for tracking this specific upload across multiple chunk uploads
      const { id: sessionId } = await zenClient.multipart.start({
        fileName: file.name, // Original filename for the uploaded file
        mimeType: file.type, // MIME type (e.g., 'image/jpeg', 'video/mp4')
        totalSize: file.size, // Total file size in bytes
        uploadMode: UploadMode.STREAMING, // Upload mode - STREAMING for real-time upload
        metadata: {
          uploadDate: Date.now(),
        },
      });

      // STEP 2: Upload file in chunks
      // Large files are split into smaller chunks to improve reliability
      // and enable progress tracking. Default MULTIPART_CHUNK_SIZE is usually 5MB
      let uploadedSize = 0; // Track how many bytes have been uploaded

      while (uploadedSize < file.size) {
        // Create a chunk from the current position to either:
        // - Current position + chunk size, OR
        // - End of file (whichever is smaller)
        const chunk = file.slice(
          uploadedSize, // Start position for this chunk
          Math.min(file.size, uploadedSize + MULTIPART_CHUNK_SIZE), // End position
        );

        // Upload this specific chunk to the FileZen session
        // The server will reassemble all chunks in the correct order
        await zenClient.multipart.uploadPart({
          sessionId: sessionId, // Links this chunk to the upload session
          chunk: chunk, // The actual file data for this part
        });

        // Update our progress tracking
        // Move the uploaded position forward by the chunk size
        uploadedSize = Math.min(file.size, uploadedSize + MULTIPART_CHUNK_SIZE);
      }

      // STEP 3: Finalize the multipart upload
      // This tells FileZen to combine all uploaded chunks into the final file
      // and makes the file available at its permanent URL
      const result = await zenClient.multipart.finish({
        sessionId: sessionId,
      });

      // STEP 4: Clean up previous file (if exists)
      // If user had previously uploaded a file, delete it to avoid clutter
      // This is optional but good practice for single-file uploads like profile pictures
      if (uploadResult) {
        zenClient.delete(uploadResult.id).then((result) => {
          if (result.error) {
            console.error('Previous file delete failed: ', result.error);
          } else {
            console.log('Previous file deleted!');
          }
        });
      }

      // STEP 5: Update UI state with successful upload
      setUploadResult(result); // Store the FileZen file object (contains URL, ID, metadata)
      setIsUploading(false); // Hide loading indicators
    } catch (error: any) {
      // Handle any errors that occurred during the upload process
      // This could be network errors, server errors, or FileZen API errors
      setError(error?.message || 'Upload failed');
      setIsUploading(false);
    }
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
      'video/mp4': ['.mp4'],
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
              {uploadResult.mimeType === 'video/mp4' ? (
                <video src={uploadResult.url} controls />
              ) : (
                <img
                  src={uploadResult.url}
                  alt="Profile"
                  className="mx-auto h-32 w-32 rounded-full object-cover ring-2 ring-gray-700"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/70 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-sm text-white">Click to change</span>
              </div>
              <div>
                {uploadResult!.metadata && (
                  <p className="text-sm text-white">
                    <br />
                    <br />
                    File metadata: <br />
                    {JSON.stringify(uploadResult!.metadata, null, ' ')}
                  </p>
                )}
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
