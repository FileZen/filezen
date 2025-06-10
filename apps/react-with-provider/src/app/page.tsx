'use client';

import { FilePickerDemo } from '@/components/FilePickerDemo';
import { UploadStatusDemo } from '@/components/UploadStatusDemo';
import { DragDropDemo } from '@/components/DragDropDemo';
import { BulkUploadDemo } from '@/components/BulkUploadDemo';

export default function Home() {

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            FileZen React SDK Examples
          </h1>
          <p className="text-xl text-gray-300">
            Complete examples showing how to use the @filezen/react SDK
          </p>
        </div>



        {/* Examples Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* File Picker Example */}
          <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-semibold text-white">File Picker</h3>
            <p className="mb-4 text-gray-300">
              Use the built-in file picker to select and upload files
            </p>
            <FilePickerDemo />
          </div>

          {/* Drag & Drop Example */}
          <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-semibold text-white">Drag & Drop</h3>
            <p className="mb-4 text-gray-300">
              Drag files directly onto the drop zone to upload them
            </p>
            <DragDropDemo />
          </div>

          {/* Bulk Upload Example */}
          <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-semibold text-white">Bulk Upload</h3>
            <p className="mb-4 text-gray-300">
              Upload multiple files at once with progress tracking
            </p>
            <BulkUploadDemo />
          </div>

          {/* Upload Status Example */}
          <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-semibold text-white">Upload Status</h3>
            <p className="mb-4 text-gray-300">
              Monitor active uploads with progress and cancel functionality
            </p>
            <UploadStatusDemo />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-400">
            Check your environment variables for FileZen API configuration
          </p>
        </div>
      </div>
    </main>
  );
} 