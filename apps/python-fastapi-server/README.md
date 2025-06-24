# FileZen Python FastAPI Server Example

This is a complete Python FastAPI server example demonstrating how to use the FileZen Python SDK for file uploads and management.

## Features

- **Single File Upload**: Upload individual files
- **Bulk File Upload**: Upload multiple files simultaneously
- **URL Upload**: Upload files directly from URLs
- **Signed URL Generation**: Generate signed URLs for secure uploads
- **File Deletion**: Delete files by URL
- **Interactive Test Interface**: HTML page for testing all endpoints with progress indicators
- **Async Support**: Full async/await support with FastAPI
- **Type Safety**: Complete type hints and validation

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   FILEZEN_API_KEY=your_filezen_api_key_here
   ```

   The API key is automatically picked up from environment variables by the SDK.

3. **Start the server:**
   ```bash
   python main.py
   ```

   The server will start on `http://localhost:8000`

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
curl -X POST http://localhost:8000/api/files/upload \
  -F "file=@/path/to/your/file.jpg"
```

**Response:**
```json
{
  "id": "file_123456789",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "type": "file",
  "state": "completed",
  "name": "file.jpg",
  "mime_type": "image/jpeg",
  "size": 12345,
  "region": "us-east-1",
  "url": "https://filezen.com/file-url",
  "project_id": "proj_123456789",
  "project": {
    "id": "proj_123456789",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "name": "My Project",
    "organisation_id": "org_123456789",
    "region": "us-east-1"
  },
  "parent_id": null,
  "parent": null,
  "metadata": {}
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
curl -X POST http://localhost:8000/api/files/bulk-upload \
  -F "files=@/path/to/file1.jpg" \
  -F "files=@/path/to/file2.png"
```

**Response:**
```json
[
  {
    "id": "file_123456789",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "type": "file",
    "state": "completed",
    "name": "file1.jpg",
    "mime_type": "image/jpeg",
    "size": 12345,
    "region": "us-east-1",
    "url": "https://filezen.com/file1-url",
    "project_id": "proj_123456789",
    "project": {
      "id": "proj_123456789",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "name": "My Project",
      "organisation_id": "org_123456789",
      "region": "us-east-1"
    },
    "parent_id": null,
    "parent": null,
    "metadata": {}
  },
  {
    "id": "file_987654321",
    "created_at": "2024-01-15T10:31:00Z",
    "updated_at": "2024-01-15T10:31:00Z",
    "type": "file",
    "state": "completed",
    "name": "file2.png",
    "mime_type": "image/png",
    "size": 67890,
    "region": "us-east-1",
    "url": "https://filezen.com/file2-url",
    "project_id": "proj_123456789",
    "project": {
      "id": "proj_123456789",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "name": "My Project",
      "organisation_id": "org_123456789",
      "region": "us-east-1"
    },
    "parent_id": null,
    "parent": null,
    "metadata": {}
  }
]
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
curl -X POST http://localhost:8000/api/files/upload-from-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/image.jpg",
    "name": "remote-image.jpg"
  }'
```

**Response:**
```json
{
  "id": "file_123456789",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "type": "file",
  "state": "completed",
  "name": "remote-image.jpg",
  "mime_type": "image/jpeg",
  "size": 12345,
  "region": "us-east-1",
  "url": "https://filezen.com/file-url",
  "project_id": "proj_123456789",
  "project": {
    "id": "proj_123456789",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "name": "My Project",
    "organisation_id": "org_123456789",
    "region": "us-east-1"
  },
  "parent_id": null,
  "parent": null,
  "metadata": {}
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
    "file_key": "my-file.jpg",
    "expires_in": 3600
  }
  ```

**Example:**
```bash
curl -X POST http://localhost:8000/api/files/generate-signed-url \
  -H "Content-Type: application/json" \
  -d '{
    "file_key": "document.pdf",
    "expires_in": 7200
  }'
```

**Response:**
```json
{
  "signed_url": "https://api.filezen.dev/files/upload?signature=abc123&accessKey=xyz&expires=1234567890",
  "expires_in": 7200
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
curl -X DELETE http://localhost:8000/api/files/delete \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://filezen.com/file-url"
  }'
```

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

## Interactive Test Interface

Visit `http://localhost:8000` in your browser to access an interactive HTML interface for testing all endpoints. The interface includes:

- File upload forms with drag-and-drop support
- Real-time response display with progress indicators
- Error handling and validation
- Easy testing of all API endpoints
- Visual feedback during operations

## SDK Usage Examples

### Basic Setup
```python
from filezen import ZenStorage

storage = ZenStorage({
    "keep_uploads": False,  # Recommended for server-side usage
})
```

### Upload a File
```python
with open("my_file.jpg", "rb") as f:
    upload = await storage.upload(f.read(), {
        "name": "my_file.jpg",
        "mime_type": "image/jpeg",
    })
    # upload.file contains the complete ZenFile object
    print(f"File uploaded: {upload.file.url}")
    print(f"File ID: {upload.file.id}")
    print(f"File size: {upload.file.size}")
```

### Bulk Upload
```python
files = [
    {"source": open("file1.jpg", "rb").read(), "options": {"name": "file1.jpg"}},
    {"source": open("file2.png", "rb").read(), "options": {"name": "file2.png"}},
]
uploads = await storage.bulk_upload(*files)
# Each upload.file contains a complete ZenFile object
for upload in uploads:
    print(f"Uploaded: {upload.file.name} -> {upload.file.url}")
```

### Generate Signed URL
```python
signed_url = storage.generate_signed_url({
    "path": "/files/upload",
    "file_key": "my_file.jpg",
    "expires_in": 3600,  # 1 hour
})
```

### Delete File
```python
success = await storage.delete_by_url("https://filezen.com/file-url")
if success:
    print("File deleted successfully")
```

## Error Handling

The server includes comprehensive error handling for:
- Missing files or invalid requests
- Network errors during uploads
- File size limits (100MB per file)
- Invalid URLs for external uploads
- SDK errors and API failures

All errors are returned with appropriate HTTP status codes and descriptive messages.

## File Size Limits

- **Single file upload**: 100MB maximum
- **Bulk upload**: Up to 10 files, 100MB each
- **URL upload**: No size limit (depends on source URL)

## Development

- **FastAPI**: Modern, fast web framework with automatic API documentation
- **Async Support**: Full async/await support for high performance
- **Type Safety**: Complete type hints and validation with Pydantic
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
- Use a production ASGI server like uvicorn with gunicorn

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your `FILEZEN_API_KEY` is set correctly in environment variables
2. **File Size Limits**: Check FastAPI and FileZen file size limits
3. **CORS Issues**: Configure CORS properly for your frontend
4. **Memory Issues**: Use `keep_uploads: false` for server-side usage

### Debug Mode

Enable debug logging by setting `DEBUG=true` in your `.env` file.

## License

This example is part of the FileZen SDK and follows the same license terms. 