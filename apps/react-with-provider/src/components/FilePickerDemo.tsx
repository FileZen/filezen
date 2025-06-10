'use client';

import { useFileZen } from '@filezen/react';
import { useState } from 'react';

export function FilePickerDemo() {
  const { openPicker } = useFileZen();
  const [lastAction, setLastAction] = useState<string>('');

  const handleSingleFile = () => {
    openPicker({ multiple: false });
    setLastAction('Opened picker for single file');
  };

  const handleMultipleFiles = () => {
    openPicker({ multiple: true });
    setLastAction('Opened picker for multiple files');
  };

  const handleImageFiles = () => {
    openPicker({ 
      multiple: true, 
      accept: 'image/*' 
    });
    setLastAction('Opened picker for image files only');
  };

  const handleDocumentFiles = () => {
    openPicker({ 
      multiple: true, 
      accept: '.pdf,.doc,.docx,.txt' 
    });
    setLastAction('Opened picker for document files');
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          onClick={handleSingleFile}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Single File
        </button>
        
        <button
          onClick={handleMultipleFiles}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Multiple Files
        </button>
        
        <button
          onClick={handleImageFiles}
          className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Images Only
        </button>
        
        <button
          onClick={handleDocumentFiles}
          className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          Documents
        </button>
      </div>
      
      {lastAction && (
        <div className="rounded bg-gray-700 p-3">
          <p className="text-sm text-green-400">✓ {lastAction}</p>
        </div>
      )}
      
      <div className="rounded bg-gray-700 p-3">
        <h4 className="mb-2 text-sm font-semibold text-white">Code Example:</h4>
        <code className="text-xs text-gray-300">
          {`const { openPicker } = useFileZen();
openPicker({ multiple: true, accept: 'image/*' });`}
        </code>
      </div>
    </div>
  );
} 