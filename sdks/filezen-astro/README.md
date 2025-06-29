# @filezen/astro

FileZen SDK for Astro applications.

## Installation

```bash
npm install @filezen/js @filezen/astro
# or
yarn add @filezen/js @filezen/astro
```

## Usage

### 1. Create an API Route

Create an Astro API route to handle file uploads:

```typescript
// src/pages/api/upload.ts
import { ZenApi } from '@filezen/js';
import { createZenAstroRouter } from '@filezen/astro';
import type { APIContext } from 'astro';

const zenApi = new ZenApi({
  apiKey: import.meta.env.FILEZEN_API_KEY,
});

const requestMiddleware = async (context: APIContext) => {
  /**
   * Here you can verify request, e.g - check user authentication:
   * const user = await getUserFromRequest(context);
   * if (!user) {
   *    throw new ZenError(401, 'Unauthorized');
   * }
   * return { userId: user.id }
   */
};

export const { POST, DELETE } = createZenAstroRouter(zenApi, {
  onRequest: requestMiddleware,
});
```

### 2. Use in Your Astro Components

```astro
---
// src/components/FileUpload.astro
---

<div id="upload-container">
  <input type="file" id="file-input" accept="image/*" />
  <div id="upload-status"></div>
</div>

<script>
  import { ZenClient } from '@filezen/js';

  const zenClient = new ZenClient('/api/upload');
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const uploadStatus = document.getElementById('upload-status');

  fileInput?.addEventListener('change', async (event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    if (uploadStatus) {
      uploadStatus.textContent = 'Uploading...';
    }

    const result = await zenClient.upload(file);

    if (result.error) {
      console.error('Upload failed:', result.error);
      if (uploadStatus) {
        uploadStatus.textContent = `Error: ${result.error.message}`;
      }
    } else {
      console.log('Upload successful:', result.file);
      if (uploadStatus) {
        uploadStatus.textContent = `Uploaded: ${result.file.url}`;
      }
    }
  });
</script>

<style>
  #upload-container {
    padding: 1rem;
    border: 2px dashed #ccc;
    border-radius: 8px;
    text-align: center;
  }
  
  #upload-status {
    margin-top: 1rem;
    font-weight: bold;
  }
</style>
```

### 3. Using with React (if enabled in Astro)

```tsx
// src/components/FileUploadReact.tsx
import { ZenClient } from '@filezen/js';
import { useState } from 'react';

const zenClient = new ZenClient('/api/upload');

export default function FileUploadReact() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadResult = await zenClient.upload(file);

    if (uploadResult.error) {
      console.error('Upload failed:', uploadResult.error);
    } else {
      setResult(uploadResult.file.url);
    }
    setUploading(false);
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} disabled={uploading} />
      {uploading && <p>Uploading...</p>}
      {result && <p>Uploaded: {result}</p>}
    </div>
  );
}
```

## API Reference

### `createZenAstroRouter(api, options?)`

Creates an Astro router for handling FileZen upload and delete requests.

**Parameters:**

- `api: ZenApi` - Instance of ZenApi
- `options?: Partial<CreateZenRouterOptions>` - Optional configuration

**Returns:**

- `{ POST, DELETE }` - Astro API route handlers

## Environment Variables

Make sure to set your FileZen API key in your environment configuration:

```bash
# .env
FILEZEN_API_KEY=your_api_key_here
```

In your `astro.config.mjs`, ensure environment variables are properly configured:

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  // ... other config
});
```

## Features

- ✅ File uploads with Astro API routes
- ✅ Built-in request validation
- ✅ TypeScript support
- ✅ Error handling
- ✅ Middleware support
- ✅ Compatible with Astro's static and SSR modes
- ✅ Works with React, Vue, Svelte components in Astro

## Requirements

- Astro 4.0+
- Node.js 18+

## Framework Integration

This SDK works seamlessly with Astro's multi-framework approach. You can use FileZen with:

- **Pure Astro components** (`.astro` files)
- **React components** (when React integration is enabled)
- **Vue components** (when Vue integration is enabled)  
- **Svelte components** (when Svelte integration is enabled)
- **Vanilla JavaScript** in client-side scripts

## Building for Production

The SDK works in both Astro's static site generation (SSG) and server-side rendering (SSR) modes. For file uploads, you'll need to use SSR mode or hybrid rendering with API routes. 