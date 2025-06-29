import { ZenClient, ZenError, type ZenFile } from '@filezen/js';
import { useCallback, useRef, useState } from 'react';

const zenClient = new ZenClient();

export default function FileUploadReact() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<ZenError | null>(null);
  const [uploadResult, setUploadResult] = useState<ZenFile | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);

      try {
        const result = await zenClient.upload(file);

        if (result.error) {
          setError(result.error);
          return;
        }

        // Delete previous file if exists
        if (uploadResult) {
          zenClient.delete(uploadResult.id).then((deleteResult) => {
            if (deleteResult.error) {
              console.error('Previous file delete failed:', deleteResult.error);
            } else {
              console.log('Previous file deleted!');
            }
          });
        }

        setUploadResult(result.file);
      } catch (err) {
        setError({
          code: 500,
          message: err instanceof Error ? err.message : 'Upload failed',
        } as ZenError);
      } finally {
        setIsUploading(false);
      }
    },
    [uploadResult],
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleUpload(file);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleUpload],
  );

  const handleClick = useCallback(() => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [isUploading]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && !isUploading) {
        handleClick();
      }
    },
    [isUploading, handleClick],
  );

  const handleDragEnter = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      dragCounterRef.current++;
      if (event.dataTransfer.types.includes('Files') && !isUploading) {
        setIsDragActive(true);
      }
    },
    [isUploading],
  );

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragActive(false);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.types.includes('Files')) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragActive(false);
      dragCounterRef.current = 0;

      if (isUploading) return;

      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
        const imageFile = Array.from(files).find(
          (file) => file.type === 'image/png' || file.type === 'image/jpeg',
        );
        if (imageFile) {
          handleUpload(imageFile);
        }
      }
    },
    [isUploading, handleUpload],
  );

  return (
    <div
      style={{
        margin: '0 auto',
        width: '100%',
        maxWidth: '28rem',
        padding: '1rem',
      }}
    >
      <div
        style={{
          fontSize: '1.125rem',
          fontWeight: 500,
          color: '#e5e7eb',
          marginBottom: '1rem',
        }}
      >
        Profile Picture (React Component)
      </div>

      <div
        style={{
          cursor: isUploading ? 'not-allowed' : 'pointer',
          borderRadius: '0.75rem',
          border: `2px dashed ${isDragActive ? '#6366f1' : '#4b5563'}`,
          padding: '1.5rem',
          textAlign: 'center',
          transition: 'all 0.2s ease-in-out',
          backgroundColor: isDragActive
            ? 'rgba(67, 56, 202, 0.1)'
            : 'transparent',
          marginBottom: '1rem',
          opacity: isUploading ? 0.5 : 1,
        }}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          disabled={isUploading}
          style={{ display: 'none' }}
        />

        {uploadResult ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={uploadResult.url}
              alt="Profile"
              style={{
                margin: '0 auto',
                height: '8rem',
                width: '8rem',
                borderRadius: '50%',
                objectFit: 'cover',
                boxShadow: '0 0 0 2px #374151',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                opacity: 0,
                transition: 'opacity 0.2s ease-in-out',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
            >
              <span style={{ fontSize: '0.875rem', color: 'white' }}>
                Click to change
              </span>
            </div>
          </div>
        ) : (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <div style={{ color: '#d1d5db' }}>
              {isDragActive ? (
                <span>Drop the image here</span>
              ) : (
                <span>Drag & drop an image here, or click to select</span>
              )}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              PNG, JPG up to 5MB
            </div>
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            borderRadius: '0.375rem',
            border: '1px solid #991b1b',
            backgroundColor: 'rgba(127, 29, 29, 0.2)',
            padding: '0.75rem',
            fontSize: '0.875rem',
            color: '#f87171',
            marginBottom: '1rem',
          }}
        >
          {error.message}
        </div>
      )}

      {isUploading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: '#818cf8',
          }}
        >
          <div
            style={{
              height: '1.25rem',
              width: '1.25rem',
              borderRadius: '50%',
              border: '2px solid transparent',
              borderBottom: '2px solid #818cf8',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span>Uploading...</span>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}
