# @filezen/next

Next.js integration for FileZen. This package provides helpers to easily set up FileZen API routes in your Next.js application.

It works in conjunction with `@filezen/js` and `@filezen/react`.

## Installation

```bash
# With npm
npm install @filezen/js @filezen/react @filezen/next

# With yarn
yarn add @filezen/js @filezen/react @filezen/next

# With pnpm
pnpm add @filezen/js @filezen/react @filezen/next
```

## Quick Start: Next.js

Here's a quick overview of how to use FileZen in a Next.js application.

### 1. Set up the API Route

Create an API route in your Next.js app to handle uploads.

**`src/app/api/upload/route.ts`**
```typescript
import { ZenApi } from '@filezen/js';
import { createZenNextRouter } from '@filezen/next';

// The ZenApi class will automatically pick up the FILEZEN_API_KEY from environment variables.
const zenApi = new ZenApi();

export const { POST, DELETE } = createZenNextRouter(zenApi);
```

### 2. Request Validation Middleware (Optional)

You can add request validation middleware to verify requests before generating signed URLs for file uploads. This is useful for implementing authentication, authorization, or other custom validation logic.

**`src/app/api/upload/route.ts`**
```typescript
import { ZenApi, ZenError } from '@filezen/js';
import { createZenNextRouter } from '@filezen/next';
import { NextRequest } from 'next/server';

const zenApi = new ZenApi();

const requestMiddleware = async (request: NextRequest) => {
  /**
   * Here you can verify request, e.g - check user authentication:
   * const user = await getUserFromRequest(request);
   * if (!user) {
   *    throw new ZenError(401, 'Unauthorized');
   * }
   * return { userId: user.id }
   */
};

export const { POST, DELETE } = createZenNextRouter(zenApi, {
  onRequest: requestMiddleware,
});
```

The middleware function can:
- Return additional metadata that will be available in the request context
- Throw a `ZenError` to reject the request with a specific status code and message
- Return `void` or `undefined` if no additional processing is needed

### 3. Add the Provider

Wrap your application with the `ZenClientProvider` from `@filezen/react`. This will provide the `ZenClient` instance to all child components.

**`src/app/layout.tsx`**
```typescript
import { ZenClientProvider } from '@filezen/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ZenClientProvider>{children}</ZenClientProvider>
      </body>
    </html>
  );
}
```

### 4. Implement the Client-side Upload

Use the `useZenClient` hook from `@filezen/react` to create a file upload component.

**`src/components/FileUpload.tsx`**
```typescript
'use client';

import { ZenFile } from '@filezen/js';
import { useZenClient } from '@filezen/react';
import React from 'react';
import { useDropzone } from 'react-dropzone';

export const FileUpload = () => {
  const zenClient = useZenClient();
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadResult, setUploadResult] = React.useState<ZenFile | null>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    const result = await zenClient.upload(file);
    setIsUploading(false);

    if (result.file) {
      setUploadResult(result.file);
    } else {
      console.error(result.error);
    }
  };

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div>
      <div {...getRootProps()} style={{ border: '2px dashed #ccc', padding: '20px', cursor: 'pointer' }}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      {isUploading && <p>Uploading...</p>}
      {uploadResult && <img src={uploadResult.url} alt="Upload preview" style={{ maxWidth: '200px' }} />}
    </div>
  );
}; 