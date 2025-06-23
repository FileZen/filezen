# @filezen/react

React hooks and components for easy integration with FileZen. This package provides providers and hooks to manage the FileZen client and storage instances in your React application.

It works in conjunction with `@filezen/js` and is a dependency for `@filezen/next`.

## Installation

```bash
# With npm
npm install @filezen/js @filezen/react

# With yarn
yarn add @filezen/js @filezen/react

# With pnpm
pnpm add @filezen/js @filezen/react
```

## Usage

### `ZenClientProvider` and `useZenClient`

The `ZenClientProvider` creates a `ZenClient` instance and provides it to all child components via the `useZenClient` hook. This provider is intended for applications that have a corresponding server-side implementation to handle file uploads and signing.

> **Important:** The `ZenClientProvider` requires a backend to handle the upload signing logic. The `signUrl` prop should point to the API endpoint that can provide a signed URL for uploading. For Next.js, the `@filezen/next` package handles this automatically if you do not provide a `signUrl`.

**Provider Setup**
```tsx
import { ZenClientProvider } from '@filezen/react';

function App() {
  return (
    // If signUrl is not provided, it defaults to '/api/upload'
    <ZenClientProvider>
      {/* Your app components */}
    </ZenClientProvider>
  );
}
```

Or, with a custom signing endpoint:
```tsx
<ZenClientProvider signUrl="/api/my-custom-signer">
  {/* ... */}
</ZenClientProvider>
```

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

**`src/components/FileUpload.tsx`**
```typescript
'use client';

import { useZenClient } from '@filezen/react';

export const FileUpload = () => {
  const zenClient = useZenClient();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const result = await zenClient.upload(file);
      if (result.file) {
        console.log('Upload successful:', result.file.url);
      } else {
        console.error('Upload failed:', result.error);
      }
    }
  };

  return <input type="file" onChange={handleFileChange} />;
};
```

### `ZenStorageProvider` and `useFileZen`

The `ZenStorageProvider` is a more advanced provider that gives you access to the `ZenStorage` instance for managing complex upload scenarios, including progress tracking, bulk uploads, and more.

**`src/app/layout.tsx`**
```typescript
import { ZenStorageProvider } from '@filezen/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ZenStorageProvider apiKey={process.env.NEXT_PUBLIC_FILEZEN_API_KEY}>
          {children}
        </ZenStorageProvider>
      </body>
    </html>
  );
}
```

**`src/components/Uploader.tsx`**
```typescript
'use client';

import { useFileZen } from '@filezen/react';
import React from 'react';

export const Uploader = () => {
  const { openPicker, uploads, activeUploads } = useFileZen();

  return (
    <div>
      <button onClick={() => openPicker()}>Upload File</button>
      <h3>All Uploads: {uploads.length}</h3>
      <h3>Active Uploads: {activeUploads.length}</h3>
    </div>
  );
};
```

This provider also includes a built-in file picker (`openPicker`) for a seamless user experience.

---

For Next.js integration, please see the [`@filezen/next`](../filezen-next/README.md) package. 
