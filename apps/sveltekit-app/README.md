# FileZen SvelteKit Example

This example demonstrates how to use FileZen for file uploads in a SvelteKit application.

## Features

- 📤 **File Upload**: Drag and drop or click to upload images
- 🔄 **File Replacement**: Automatically deletes previous files when uploading new ones
- ⚡ **SvelteKit API Routes**: Server-side upload handling with type safety
- 🎨 **Modern UI**: Clean dark theme interface with drag-and-drop, upload progress and error handling
- 🔧 **TypeScript**: Full type safety throughout the application

## Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn (this project uses Yarn workspaces)
- FileZen API key

### Installation

1. Install dependencies:
```bash
yarn install
```

2. Set up your environment variables:
```bash
# Create .env file in the root of your project
FILEZEN_API_KEY=your_api_key_here
```

3. Start the development server:
```bash
yarn dev
```

4. Open [http://localhost:5173](http://localhost:5173) to view the application.

## Project Structure

```
src/
├── routes/
│   ├── +layout.svelte          # Root layout
│   ├── +page.svelte            # Home page
│   └── api/
│       └── upload/
│           └── +server.ts      # Upload API endpoint
├── lib/
│   └── components/
│       └── FileUpload.svelte   # File upload component
├── app.css                     # Global styles
└── app.html                    # HTML template
```

## How It Works

1. **Upload Component**: The `FileUpload.svelte` component provides a polished drag-and-drop interface with vanilla CSS styling
2. **API Route**: The `/api/upload` endpoint uses `@filezen/svelte` router with destructured exports for clean SvelteKit integration
3. **Client Integration**: Direct `ZenClient` usage in the component for simple, effective file uploads
4. **File Management**: Automatically handles file replacement and cleanup with proper error handling

## Key Technologies

- **SvelteKit**: Full-stack framework for building web applications
- **FileZen**: File upload and management service
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **Vanilla CSS**: Component-scoped styling without external dependencies

## API Endpoints

- `POST /api/upload` - Upload a file
- `DELETE /api/upload` - Delete a file

## Configuration

The upload behavior can be customized in the API route (`src/routes/api/upload/+server.ts`):

```typescript
import { FILEZEN_API_KEY } from '$env/static/private';
import { ZenApi } from '@filezen/js';
import { createZenSvelteRouter } from '@filezen/svelte';
import type { RequestEvent } from '@sveltejs/kit';

const zenApi = new ZenApi({
  apiKey: FILEZEN_API_KEY,
});

const requestMiddleware = async (event: RequestEvent) => {
  // Add authentication, validation, etc.
  // Return metadata to be passed to FileZen
};

const router = createZenSvelteRouter(zenApi, {
  onRequest: requestMiddleware,
});

export const { POST, DELETE } = router;
```

## Building for Production

```bash
yarn build
```

## Related Packages

- `@filezen/js` - Core FileZen JavaScript SDK
- `@filezen/svelte` - SvelteKit-specific FileZen utilities 