# FileZen H3 Server Example

This is a complete H3 server example demonstrating how to use the FileZen JavaScript SDK for file uploads and management. Built with [H3](https://v1.h3.dev/guide), a lightweight and composable server framework.

## Features

- **Single File Upload**: Upload individual files
- **Bulk File Upload**: Upload multiple files simultaneously
- **URL Upload**: Upload files directly from URLs
- **Signed URL Generation**: Generate signed URLs for secure uploads
- **File Deletion**: Delete files by URL
- **Interactive Test Interface**: HTML page for testing all endpoints with progress indicators

## Why H3?

This example uses H3 for several advantages:

- **Lightweight**: Minimal overhead and fast startup
- **Universal**: Works with Node.js, Bun, Deno, and edge runtimes
- **Composable**: Event-driven architecture with reusable handlers
- **Modern**: Built-in TypeScript support and ESM-first
- **Cross-platform**: Designed for multiple JavaScript runtimes
- **Performance**: Optimized for speed and efficiency

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   FILEZEN_API_KEY=your_filezen_api_key_here
   ```

   The API key is automatically picked up from environment variables by the SDK.

3. **Start the server:**
   
   **Development (recommended):**
   ```bash
   npm run dev
   ```
   
   **Production:**
   ```bash
   npm run build
   npm start
   ```

   The server will start on `http://localhost:3003`

## API Endpoints

### 1. Single File Upload
**POST** `/api/files/upload`

Upload a single file using multipart form data.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `file` (required): The file to upload

**Example:**
```bash
curl -X POST http://localhost:3003/api/files/upload \
  -F "file=@/path/to/your/file.jpg"
```

**Response:**
```json
{
  "success": true,
  "file": {
    "url": "https://filezen.com/file-url",
    "name": "file.jpg",
    "size": 12345,
    "mimeType": "image/jpeg"
  }
}
```

### 2. Bulk File Upload
**POST** `/api/files/bulk-upload`

Upload multiple files simultaneously.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `files` (required): Array of files to upload

**Example:**
```bash
curl -X POST http://localhost:3003/api/files/bulk-upload \
  -F "files=@/path/to/file1.jpg" \
  -F "files=@/path/to/file2.png"
```

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "url": "https://filezen.com/file1-url",
      "name": "file1.jpg",
      "size": 12345,
      "mimeType": "image/jpeg"
    },
    {
      "url": "https://filezen.com/file2-url",
      "name": "file2.png",
      "size": 67890,
      "mimeType": "image/png"
    }
  ]
}
```

### 3. Upload from URL
**POST** `/api/files/upload-from-url`

Upload a file directly from a URL.

**Request:**
- Content-Type: `application/json`
- Body:
  ```json
  {
    "url": "https://example.com/file.jpg",
    "name": "downloaded-file.jpg"
  }
  ```

**Example:**
```bash
curl -X POST http://localhost:3003/api/files/upload-from-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/image.jpg",
    "name": "remote-image.jpg"
  }'
```

**Response:**
```json
{
  "success": true,
  "file": {
    "url": "https://filezen.com/file-url",
    "name": "remote-image.jpg",
    "size": 12345,
    "mimeType": "image/jpeg"
  }
}
```

### 4. Generate Signed URL
**POST** `/api/files/generate-signed-url`

Generate a signed URL for secure file uploads.

**Request:**
- Content-Type: `application/json`
- Body:
  ```json
  {
    "fileKey": "my-file.jpg",
    "expiresIn": 3600
  }
  ```

**Example:**
```bash
curl -X POST http://localhost:3003/api/files/generate-signed-url \
  -H "Content-Type: application/json" \
  -d '{
    "fileKey": "document.pdf",
    "expiresIn": 7200
  }'
```

**Response:**
```json
{
  "success": true,
  "signedUrl": "https://api.filezen.dev/files/upload?signature=abc123&accessKey=xyz&expires=1234567890",
  "expiresIn": 7200
}
```

### 5. Delete File
**DELETE** `/api/files/delete`

Delete a file by its URL.

**Request:**
- Content-Type: `application/json`
- Body:
  ```json
  {
    "url": "https://filezen.com/file-url"
  }
  ```

**Example:**
```bash
curl -X DELETE http://localhost:3003/api/files/delete \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://filezen.com/file-url"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

## Error Handling

The server includes comprehensive error handling with proper HTTP status codes and detailed error messages:

### Upload-Specific Error Checking

The server properly validates FileZen SDK upload results:

1. **Single File Upload Errors**: Checks `upload.error` before returning success
2. **Bulk Upload Errors**: Validates each upload in the batch and provides detailed failure information
3. **Network Errors**: Handles fetch failures for URL uploads
4. **Validation Errors**: Returns 400 status for missing required parameters

### Error Types Handled

- Missing files or invalid requests (400 Bad Request)
- Network errors during uploads (500 Internal Server Error)
- File size limits and validation errors
- Invalid URLs for external uploads (400 Bad Request)
- SDK upload failures (500 Internal Server Error)
- API authentication failures

### Standard Error Response
```json
{
  "statusCode": 400,
  "statusMessage": "Error description",
  "data": {
    "message": "Detailed error message"
  }
}
```

### Bulk Upload Error Response
For bulk uploads, if some files fail while others succeed:

```json
{
  "statusCode": 500,
  "statusMessage": "Some uploads failed",
  "data": {
    "message": "2 out of 5 uploads failed",
    "failures": [
      {
        "name": "failed-file1.jpg",
        "error": "File too large"
      },
      {
        "name": "failed-file2.pdf",
        "error": "Invalid file type"
      }
    ]
  }
}
```

## SDK Usage Examples

### Basic Setup
```typescript
import { ZenStorage } from '@filezen/js';

const zenStorage = new ZenStorage({
  keepUploads: false, // Recommended for server-side usage
});
```

### Upload a File
```typescript
const fileBuffer = Buffer.from(fileData);
const upload = await zenStorage.upload(fileBuffer, {
  name: 'my-file.jpg',
  mimeType: 'image/jpeg',
});

// Always check for upload errors
if (upload.error) {
  console.error('Upload failed:', upload.error.message);
  return;
}

console.log('Upload successful:', upload.file);
```

### Bulk Upload
```typescript
const uploadItems = files.map(file => ({
  source: Buffer.from(file.buffer),
  options: {
    name: file.originalname,
    mimeType: file.mimetype,
  },
}));

const uploads = await zenStorage.bulkUpload(...uploadItems);

// Check for any upload errors
const failedUploads = uploads.filter(upload => upload.error);
if (failedUploads.length > 0) {
  console.error(`${failedUploads.length} uploads failed`);
  failedUploads.forEach(upload => {
    console.error(`- ${upload.name}: ${upload.error?.message}`);
  });
  return;
}

console.log('All uploads successful:', uploads.map(upload => upload.file));
```

### Generate Signed URL
```typescript
const signedUrl = zenStorage.generateSignedUrl({
  path: '/files/upload',
  fileKey: 'my-file.jpg',
  expiresIn: 3600, // 1 hour
});
```

### Delete File
```typescript
await zenStorage.deleteByUrl('https://filezen.com/file-url');
```

## Development

- **Development**: `npm run dev` (uses listhen with auto-reload)
- **Build**: `npm run build`
- **Production**: `npm start` (uses dotenv to load .env file)

## Environment Variables

The server requires only one environment variable:

```env
FILEZEN_API_KEY=your_filezen_api_key_here
```

Create a `.env` file in the root directory with your FileZen API key. The server automatically loads this file using dotenv.

## H3-Specific Features

### Event Handlers
H3 uses event handlers instead of middleware:
```typescript
defineEventHandler(async (event) => {
  // Handle request
  return response;
});
```

### Built-in Utilities
- `readMultipartFormData()`: Parse multipart form data
- `readBody()`: Parse request body with type safety
- `createError()`: Create structured errors
- `serveStatic()`: Serve static files

### Router System
```typescript
const router = createRouter();
router.post('/api/endpoint', handler);
app.use(router);
```

## Key Differences from Express/Fastify

1. **Event-Driven**: Uses event handlers instead of middleware/plugins
2. **Built-in Utilities**: Native multipart and body parsing
3. **Error Handling**: Structured error system with `createError()`
4. **Static Files**: Built-in `serveStatic` utility
5. **Universal**: Runs on multiple JavaScript runtimes
6. **Lightweight**: Minimal dependencies and overhead
7. **Type Safety**: Built-in TypeScript support

## Architecture

The server uses:
- **H3**: Universal server framework
- **listhen**: Development server with auto-reload
- **@filezen/js**: FileZen SDK for file operations
- **Built-in utilities**: For multipart parsing and error handling

## Testing

Visit `http://localhost:3003/` to access the interactive test interface where you can:
- Upload single files
- Upload multiple files
- Upload files from URLs
- Generate signed URLs
- Delete files

The test interface provides real-time feedback and shows the API responses.

## Production Deployment

H3 apps can be deployed to various platforms:

### Node.js
```bash
npm run build
npm start
```

### Bun
```bash
bun run build
bun dist/index.js
```

### Deno
```bash
deno run --allow-net --allow-read dist/index.js
```

### Edge Runtimes
H3 can be adapted to work with Cloudflare Workers, Vercel Edge, and other edge runtimes using adapters.

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your `FILEZEN_API_KEY` is set correctly in environment variables
2. **Module Resolution**: H3 works best with ESM, ensure proper module configuration
3. **Runtime Compatibility**: Verify your JavaScript runtime supports H3
4. **Memory Issues**: Use `keepUploads: false` for server-side usage

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## License

This example is part of the FileZen SDK and follows the same license terms. 