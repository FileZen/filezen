'use client';

import { FileZenDropContainer } from '@filezen/react/drop-container/FileZenDropContainer';
import { useState } from 'react';

interface DropZoneProps {
  isDraggedOver?: boolean;
}

function DropZone({ isDraggedOver }: DropZoneProps) {
  const [dragCount, setDragCount] = useState(0);

  return (
    <div
      className={`flex h-32 items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 ${
        isDraggedOver
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600'
      }`}
      onDrop={() => setDragCount((prev) => prev + 1)}
    >
      <div className="text-center">
        <svg
          className={`mx-auto h-8 w-8 transition-colors ${
            isDraggedOver ? 'text-blue-400' : 'text-gray-400'
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
            isDraggedOver ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300'
          }`}
        >
          {isDraggedOver ? 'Drop files here!' : 'Drag and drop files here'}
        </p>
        <p className="text-xs text-gray-400">Files dropped: {dragCount}</p>
      </div>
    </div>
  );
}

export function DragDropDemo() {
  return (
    <div className="space-y-4">
      <FileZenDropContainer className="relative">
        <DropZone />
      </FileZenDropContainer>

      <div className="rounded bg-gray-700 p-3">
        <h4 className="mb-2 text-sm font-semibold text-white">Code Example:</h4>
        <code className="text-xs text-gray-300">
          {`import { FileZenDropContainer } from '@filezen/react/drop-container/FileZenDropContainer';

function DropZone({ isDraggedOver }) {
  return (
    <div className={isDraggedOver ? 'drag-over-styles' : 'default-styles'}>
      {isDraggedOver ? 'Drop files here!' : 'Drag files here'}
    </div>
  );
}

<FileZenDropContainer>
  <DropZone />
</FileZenDropContainer>`}
        </code>
      </div>
    </div>
  );
}
