# @filezen/svelte

FileZen SDK for SvelteKit applications.

## Installation

```bash
npm install @filezen/js @filezen/svelte
# or
yarn add @filezen/js @filezen/svelte
```

## Usage

### 1. Create an API Route

Create a SvelteKit API route to handle file uploads:

```typescript
// src/routes/api/upload/+server.ts
import { FILEZEN_API_KEY } from '$env/static/private';
import { ZenApi } from '@filezen/js';
import { createZenSvelteRouter } from '@filezen/svelte';
import type { RequestEvent } from '@sveltejs/kit';

const zenApi = new ZenApi({
  apiKey: FILEZEN_API_KEY,
});

const requestMiddleware = async (event: RequestEvent) => {
  /**
   * Here you can verify request, e.g - check user authentication:
   * const user = await getUserFromRequest(event);
   * if (!user) {
   *    throw new ZenError(401, 'Unauthorized');
   * }
   * return { userId: user.id }
   */
};

const router = createZenSvelteRouter(zenApi, {
  onRequest: requestMiddleware,
});

export const { POST, DELETE } = router;
```

### 2. Use in Your Svelte Components

```svelte
<script lang="ts">
  import { ZenClient } from '@filezen/js';

  const zenClient = new ZenClient('/api/upload');

  async function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    const result = await zenClient.upload(file);

    if (result.error) {
      console.error('Upload failed:', result.error);
    } else {
      console.log('Upload successful:', result.file);
    }
  }
</script>

<input type="file" on:change={handleFileUpload} />
```

## API Reference

### `createZenSvelteRouter(api, options?)`

Creates a SvelteKit router for handling FileZen upload and delete requests.

**Parameters:**

- `api: ZenApi` - Instance of ZenApi
- `options?: Partial<CreateZenRouterOptions>` - Optional configuration

**Returns:**

- `{ POST, DELETE }` - SvelteKit route handlers

## Features

- ✅ File uploads with SvelteKit API routes
- ✅ Built-in request validation
- ✅ TypeScript support
- ✅ Error handling
- ✅ Middleware support

## Requirements

- SvelteKit 1.0+
- Node.js 18+
