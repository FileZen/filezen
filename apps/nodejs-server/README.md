# FileZen Node.js Server Example

This is a complete Node.js server example demonstrating how to use the FileZen JavaScript SDK for file uploads and management.

## Features

- **Single File Upload**: Upload individual files
- **Bulk File Upload**: Upload multiple files simultaneously
- **URL Upload**: Upload files directly from URLs
- **Signed URL Generation**: Generate signed URLs for secure uploads
- **File Deletion**: Delete files by URL
- **Interactive Test Interface**: HTML page for testing all endpoints with progress indicators

## Setup

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   FILEZEN_API_KEY=your_filezen_api_key_here
   ```

   The API key is automatically picked up from environment variables by the SDK.

3. **Start the server:**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3001`

## API Endpoints

### 1. Single File Upload
**POST** `/api/files/upload`

Upload a single file.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `file` (required): The file to upload

**Example:**
```bash
curl -X POST http://localhost:3001/api/files/upload \
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
curl -X POST http://localhost:3001/api/files/bulk-upload \
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
curl -X POST http://localhost:3001/api/files/upload-from-url \
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
curl -X POST http://localhost:3001/api/files/generate-signed-url \
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
curl -X DELETE http://localhost:3001/api/files/delete \
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

## Interactive Test Interface

Visit `http://localhost:3001` in your browser to access an interactive HTML interface for testing all endpoints. The interface includes:

- File upload forms with drag-and-drop support
- Real-time response display with progress indicators
- Error handling and validation
- Easy testing of all API endpoints
- Visual feedback during operations

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

## Error Handling

The server includes comprehensive error handling with proper HTTP status codes and detailed error messages:

### Upload-Specific Error Checking

The server now properly validates FileZen SDK upload results:

1. **Single File Upload Errors**: Checks `upload.error` before returning success
2. **Bulk Upload Errors**: Validates each upload in the batch and provides detailed failure information
3. **Network Errors**: Handles fetch failures for URL uploads
4. **Validation Errors**: Returns 400 status for missing required parameters

### Error Types Handled

- Missing files or invalid requests (400 Bad Request)
- Network errors during uploads (500 Internal Server Error)
- File size limits (100MB per file)
- Invalid URLs for external uploads (400 Bad Request)
- SDK upload failures (500 Internal Server Error)
- API authentication failures

### Standard Error Response
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Bulk Upload Error Response
For bulk uploads, if some files fail while others succeed, the server returns detailed error information:

```json
{
  "error": "Some uploads failed",
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
```

This ensures you can identify which specific files failed and why, allowing for targeted retry operations.

## File Size Limits

- **Single file upload**: 100MB maximum
- **Bulk upload**: Up to 10 files, 100MB each
- **URL upload**: No size limit (depends on source URL)

## Development

- **TypeScript**: Full TypeScript support with type safety
- **Hot reload**: Development server with automatic restarts
- **Error handling**: Comprehensive error handling and logging
- **CORS**: Configured for local development
- **Progress indicators**: Visual feedback for all operations

## Production Considerations

- Set appropriate file size limits based on your needs
- Configure proper CORS settings for production
- Add authentication and authorization as needed
- Consider rate limiting for API endpoints
- Set up proper logging and monitoring

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your `FILEZEN_API_KEY` is set correctly in environment variables
2. **File Size Limits**: Check multer and FileZen file size limits
3. **CORS Issues**: Configure CORS properly for your frontend
4. **Memory Issues**: Use `keepUploads: false` for server-side usage

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## License

This example is part of the FileZen SDK and follows the same license terms. 