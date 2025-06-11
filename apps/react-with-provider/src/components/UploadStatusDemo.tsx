'use client';

import type { ZenUpload } from '@filezen/js';
import { useFileZen } from '@filezen/react';
import { useEffect, useState } from 'react';

export function UploadStatusDemo() {
  const { uploads, cancel } = useFileZen();
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
    // Set up progress listeners for all uploads
    const listeners = uploads.map((upload) => {
      const listener = {
        onProgress: (upload: ZenUpload, progress: number) => {
          setUploadProgress((prev) => ({
            ...prev,
            [upload.localId]: progress,
          }));
        },
        onComplete: (upload: ZenUpload) => {
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[upload.localId];
            return newProgress;
          });
        },
        onError: (upload: ZenUpload) => {
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[upload.localId];
            return newProgress;
          });
        },
      };

      upload.addListener(listener);
      return { upload, listener };
    });

    // Cleanup listeners when component unmounts or uploads change
    return () => {
      listeners.forEach(({ upload, listener }) => {
        upload.removeListener(listener);
      });
    };
  }, [uploads]);

  const handleCancel = (upload: ZenUpload) => {
    cancel(upload);
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[upload.localId];
      return newProgress;
    });
  };

  const getStatusText = (upload: ZenUpload) => {
    if (!upload.isCompleted && !upload.error) {
      const progress = uploadProgress[upload.localId];
      return progress !== undefined
        ? `Uploading ${Math.round(progress)}%`
        : 'Uploading...';
    }
    if (upload.isCompleted) return 'completed';
    if (upload.error) return 'error';
    return 'pending';
  };

  const getStatusColor = (upload: ZenUpload) => {
    if (upload.isCompleted) return 'text-green-400';
    if (upload.error) return 'text-red-400';
    if (!upload.isCompleted && !upload.error) return 'text-blue-400';
    return 'text-gray-300';
  };

  return (
    <div className="space-y-4">
      {uploads.length === 0 ? (
        <div className="rounded bg-gray-700 p-4 text-center">
          <p className="text-gray-400">No active uploads</p>
          <p className="mt-1 text-xs text-gray-500">
            Start uploading files to see progress here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {uploads.map((upload) => (
            <div key={upload.localId} className="rounded bg-gray-700 p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {upload.file?.name || upload.name || 'Unknown file'}
                  </p>
                  <p className={`text-xs ${getStatusColor(upload)}`}>
                    {getStatusText(upload)}
                  </p>
                </div>

                {!upload.isCompleted && !upload.error && (
                  <button
                    onClick={() => handleCancel(upload)}
                    className="ml-2 rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 focus:ring-1 focus:ring-red-500 focus:outline-none"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {!upload.isCompleted &&
                !upload.error &&
                uploadProgress[upload.localId] !== undefined && (
                  <div className="mt-2">
                    <div className="h-2 w-full rounded-full bg-gray-600">
                      <div
                        className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${uploadProgress[upload.localId]}%` }}
                      />
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}

      <div className="rounded bg-gray-700 p-3">
        <h4 className="mb-2 text-sm font-semibold text-white">Code Example:</h4>
        <code className="text-xs text-gray-300">
          {`const { uploads, cancel } = useFileZen();

// Monitor upload progress
useEffect(() => {
  uploads.forEach(upload => {
    upload.addListener({
      onProgress: (upload, progress) => {
        console.log(\`\${upload.file.name}: \${progress}%\`);
      }
    });
  });
}, [uploads]);

// Cancel an upload
cancel(upload);`}
        </code>
      </div>
    </div>
  );
}
