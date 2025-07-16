# @filezen/remix

FileZen SDK for Remix applications.

## Installation

```bash
yarn add @filezen/remix
```

## Usage

### Basic Setup

Create a resource route for file uploads:

```tsx
// app/routes/api.upload.tsx
import { ZenApi } from '@filezen/js';
import { createZenRemixRouter } from '@filezen/remix';

const zenApi = new ZenApi();

export const { action, loader } = createZenRemixRouter(zenApi);
```

### With Authentication

Add request middleware for authentication:

```tsx
// app/routes/api.upload.tsx
import { ZenApi, ZenError } from '@filezen/js';
import { createZenRemixRouter } from '@filezen/remix';

const zenApi = new ZenApi();

const requestMiddleware = async (request: Request) => {
  // Add your authentication logic here
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new ZenError(401, 'Unauthorized');
  }
  return { userId: user.id };
};

export const { action, loader } = createZenRemixRouter(zenApi, {
  onRequest: requestMiddleware,
});
```

### Client-Side Usage

Use the FileZen React hooks in your components:

```tsx
// app/components/FileUpload.tsx
import { useZenClient } from '@filezen/react';

export const FileUpload = () => {
  const zenClient = useZenClient();
  
  const handleUpload = async (file: File) => {
    const result = await zenClient.upload(file);
    if (result.error) {
      console.error('Upload failed:', result.error);
    } else {
      console.log('Upload successful:', result.file);
    }
  };

  return (
    <input 
      type="file" 
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
      }} 
    />
  );
};
```

### Provider Setup

Wrap your app with the FileZen providers:

```tsx
// app/root.tsx
import { ZenClientProvider, ZenStorageProvider } from '@filezen/react';
import { ZenApi } from '@filezen/js';

const zenApi = new ZenApi();

export default function App() {
  return (
    <html>
      <body>
        <ZenStorageProvider>
          <ZenClientProvider api={zenApi}>
            <Outlet />
          </ZenClientProvider>
        </ZenStorageProvider>
      </body>
    </html>
  );
}
```

## API Reference

### `createZenRemixRouter(api, options?)`

Creates Remix action and loader functions for file uploads.

#### Parameters

- `api: ZenApi` - FileZen API instance
- `options?: CreateZenRouterOptions` - Optional configuration

#### Returns

- `action: ActionFunction` - Remix action for POST requests (uploads)
- `loader: LoaderFunction` - Remix loader for DELETE requests (deletions)

## Dependencies

This package requires:

- `@filezen/js` - Core FileZen SDK
- `@filezen/react` - React hooks and providers
- `@remix-run/node` - Remix server utilities
- `react` - React library 