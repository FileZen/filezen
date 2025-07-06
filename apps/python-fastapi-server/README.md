# FileZen Python FastAPI Server Example

A comprehensive Python FastAPI server example demonstrating all FileZen Python SDK features including **full IDE support**, **type safety**, metadata support, URL/base64 uploads, streaming uploads, manual multipart control, and flexible API styles.

## Features

### 🚀 Core Upload Features
- **Single File Upload**: Upload individual files with metadata support
- **Bulk File Upload**: Upload multiple files with mixed source types
- **URL Upload**: Upload files directly from URLs with automatic streaming
- **Base64 Upload**: Upload files from base64 encoded data
- **Text Upload**: Upload text content as files
- **Streaming Upload**: Upload with unknown total size
- **Manual Multipart Control**: Full control over multipart upload process

### 🎯 Advanced Features
- **Full IDE Support**: Complete autocomplete and type checking
- **Type Safety**: All parameters fully typed with dataclasses
- **Flexible Parameters**: Accept both dataclasses and dictionaries
- **Metadata Support**: Rich metadata for all upload types
- **Event Listeners**: Real-time upload event tracking
- **Progress Tracking**: Upload progress and status monitoring
- **Mixed Source Types**: Bulk upload with different source types
- **Signed URL Generation**: Generate signed URLs for secure uploads
- **File Deletion**: Delete files by URL

### 🔧 Technical Features
- **Interactive Test Interface**: HTML page for testing all endpoints
- **Async Support**: Full async/await support with FastAPI
- **Type Safety**: Complete type hints and validation
- **Error Handling**: Comprehensive error handling and logging
- **Auto-Documentation**: Interactive API docs with Swagger UI

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   
   This will automatically install the FileZen SDK in editable mode from the local `../../sdks/filezen-python` directory along with all other dependencies.

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   FILEZEN_API_KEY=your_filezen_api_key_here
   ```

3. **Start the server:**
   ```bash
   python main.py
   ```

   The server will start on `http://localhost:8000`

## API Endpoints

### 1. Basic File Upload
**POST** `/api/files/upload`

Upload a single file (basic upload without metadata).

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (required): The file to upload

**Example:**
```bash
curl -X POST http://localhost:8000/api/files/upload \
  -F "file=@/path/to/your/file.jpg"
```

### 2. Upload with Metadata
**POST** `/api/files/upload-with-metadata`

Upload a file with rich metadata support.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `file` (required): The file to upload
  - `metadata` (optional): JSON string with metadata
  - `project_id` (optional): Project ID
  - `folder_id` (optional): Folder ID

**Example:**
```bash
curl -X POST http://localhost:8000/api/files/upload-with-metadata \
  -F "file=@/path/to/document.pdf" \
  -F "metadata={\"author\": \"John Doe\", \"version\": \"1.0\", \"tags\": [\"important\", \"document\"]}" \
  -F "project_id=proj_123456789"
```

### 3. Bulk File Upload
**POST** `/api/files/bulk-upload`

Upload multiple files simultaneously with automatic metadata.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `files` (required): Array of files to upload

**Example:**
```bash
curl -X POST http://localhost:8000/api/files/bulk-upload \
  -F "files=@/path/to/file1.jpg" \
  -F "files=@/path/to/file2.png" \
  -F "files=@/path/to/file3.pdf"
```

### 4. Upload from URL
**POST** `/api/files/upload-from-url`

Upload a file directly from URL using SDK's built-in URL support with automatic streaming.

**Request:**
- Content-Type: `application/json`
- Body:
  ```json
  {
    "url": "https://example.com/file.jpg",
    "name": "downloaded-file.jpg",
    "metadata": {
      "source": "external",
      "original_url": "https://example.com/file.jpg"
    }
  }
  ```

**Example:**
```bash
curl -X POST http://localhost:8000/api/files/upload-from-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/large-video.mp4",
    "name": "streaming-video.mp4",
    "metadata": {"source": "youtube", "quality": "1080p"}
  }'
```

### 5. Upload from Base64
**POST** `/api/files/upload-from-base64`

Upload a file from base64 encoded data (supports data URLs and plain base64).

**Request:**
- Content-Type: `application/json`
- Body:
  ```json
  {
    "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "name": "pixel.png",
    "metadata": {
      "source": "base64",
      "encoding": "base64"
    }
  }
  ```

**Example:**
```bash
curl -X POST http://localhost:8000/api/files/upload-from-base64 \
  -H "Content-Type: application/json" \
  -d '{
    "data": "data:text/plain;base64,SGVsbG8gV29ybGQ=",
    "name": "hello.txt",
    "metadata": {"source": "base64", "content": "Hello World"}
  }'
```

### 6. Upload Text Content
**POST** `/api/files/upload-text`

Upload text content as a file.

**Request:**
- Content-Type: `application/json`
- Body:
  ```json
  {
    "text": "Hello, World!\nThis is a text file.",
    "name": "greeting.txt",
    "mime_type": "text/plain",
    "metadata": {
      "source": "text",
      "lines": 2
    }
  }
  ```

**Example:**
```bash
curl -X POST http://localhost:8000/api/files/upload-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "# My Document\n\nThis is a markdown file.",
    "name": "document.md",
    "mime_type": "text/markdown"
  }'
```

### 7. Streaming Upload
**POST** `/api/files/streaming-upload`

Demonstrate streaming upload with unknown total size.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `chunk_size` (optional): Size of each chunk (default: 1MB)
  - `total_chunks` (optional): Number of chunks to simulate (default: 5)
  - `filename` (optional): Name for the uploaded file

**Example:**
```bash
curl -X POST http://localhost:8000/api/files/streaming-upload \
  -F "chunk_size=2097152" \
  -F "total_chunks=3" \
  -F "filename=streaming_data.bin"
```

### 8. Manual Multipart Upload Control

#### 8.1 Start Multipart Upload
**POST** `/api/files/multipart/start`

Start a multipart upload session.

**Request:**
- Content-Type: `application/json`
- Body:
  ```json
  {
    "file_name": "large_file.bin",
    "mime_type": "application/octet-stream",
    "total_size": 10485760,
    "upload_mode": "multipart",
    "metadata": {
      "source": "multipart",
      "description": "Large binary file"
    }
  }
  ```

**Example:**
```bash
curl -X POST http://localhost:8000/api/files/multipart/start \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "video.mp4",
    "mime_type": "video/mp4",
    "total_size": 52428800,
    "upload_mode": "multipart",
    "metadata": {"source": "camera", "resolution": "1080p"}
  }'
```

#### 8.2 Upload Multipart Chunk
**POST** `/api/files/multipart/upload-part`

Upload a chunk for multipart upload.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `session_id` (required): Session ID from start request
  - `chunk_index` (required): Index of the chunk (0-based)
  - `chunk` (required): Binary chunk data

**Example:**
```bash
curl -X POST http://localhost:8000/api/files/multipart/upload-part \
  -F "session_id=session_123456789" \
  -F "chunk_index=0" \
  -F "chunk=@/path/to/chunk0.bin"
```

#### 8.3 Finish Multipart Upload
**POST** `/api/files/multipart/finish`

Finish a multipart upload session.

**Request:**
- Content-Type: `application/json`
- Body:
  ```json
  {
    "session_id": "session_123456789"
  }
  ```

**Example:**
```bash
curl -X POST http://localhost:8000/api/files/multipart/finish \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session_123456789"
  }'
```

### 9. Generate Signed URL
**POST** `/api/files/generate-signed-url`

Generate a signed URL for secure file uploads.

**Request:**
- Content-Type: `application/json`
- Body:
  ```json
  {
    "file_key": "document.pdf",
    "expires_in": 7200
  }
  ```

**Example:**
```bash
curl -X POST http://localhost:8000/api/files/generate-signed-url \
  -H "Content-Type: application/json" \
  -d '{
    "file_key": "secure-document.pdf",
    "expires_in": 3600
  }'
```

### 10. Delete File
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

### 11. Mixed Upload Demo
**GET** `/api/demo/mixed-upload`

Demonstrate bulk upload with mixed source types (text, base64, URL, bytes).

**Example:**
```bash
curl -X GET http://localhost:8000/api/demo/mixed-upload
```

## Interactive Test Interface

Visit `http://localhost:8000` in your browser to access an interactive HTML interface for testing all endpoints. The interface includes:

- Forms for all upload types with drag-and-drop support
- Real-time response display with syntax highlighting
- Progress indicators and upload status
- Error handling and validation
- Interactive testing of all API endpoints
- Visual feedback during operations

## SDK Usage Examples

### Basic Setup with Event Listener
```python
from filezen import ZenStorage, ZenUploadListener, ZenProgress

class MyUploadListener(ZenUploadListener):
    def on_upload_start(self, upload):
        print(f"🚀 Upload started: {upload.name}")
    
    def on_upload_progress(self, upload, progress: ZenProgress):
        if progress.percent:
            print(f"📊 Progress: {upload.name} - {progress.percent:.1f}%")
    
    def on_upload_complete(self, upload):
        print(f"✅ Upload completed: {upload.name}")
    
    def on_upload_error(self, upload, error):
        print(f"❌ Upload error: {error}")

storage = ZenStorage(api_key="your_api_key", keep_uploads=True)
storage.add_listener(MyUploadListener())
```

### Upload with Metadata (Multiple Styles)
```python
from filezen import ZenStorage, ZenStorageUploadOptions

storage = ZenStorage(api_key="your_api_key")

# ✅ RECOMMENDED: Using dataclass for full IDE support
options = ZenStorageUploadOptions(
    name="document.pdf",
    metadata={"author": "John", "version": "1.0"},
    project_id="proj_123",
    folder_id="folder_456"
)
upload = await storage.upload(file_data, options)

# ✅ DICT: Also supported for flexibility
upload = await storage.upload(file_data, {
    "name": "document.pdf",
    "metadata": {"author": "John", "version": "1.0"},
    "project_id": "proj_123"
})

# ✅ KEYWORD ARGS: Quick and simple
upload = await storage.upload(
    file_data,
    name="document.pdf",
    metadata={"author": "John", "version": "1.0"},
    project_id="proj_123"
)
```

### URL Upload with Automatic Streaming
```python
# SDK automatically handles streaming for URLs
upload = await storage.upload(
    "https://example.com/large-video.mp4",
    name="downloaded-video.mp4",
    metadata={"source": "url", "quality": "1080p"}
)
```

### Base64 Upload
```python
# Supports both data URLs and plain base64
upload = await storage.upload(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    name="pixel.png",
    metadata={"source": "base64", "format": "png"}
)
```

### Text Upload
```python
upload = await storage.upload(
    "Hello, World!\nThis is a text file.",
    name="greeting.txt",
    mime_type="text/plain",
    metadata={"source": "text", "lines": 2}
)
```

### Streaming Upload with Dataclasses
```python
from filezen import StartMultipartUploadParams, MultipartUploadChunkParams, FinishMultipartUploadParams, UploadMode

# Start streaming upload (unknown total size)
start_params = StartMultipartUploadParams(
    file_name="stream_data.bin",
    mime_type="application/octet-stream",
    upload_mode=UploadMode.STREAMING,
    metadata={"source": "streaming"}
)
session = await storage.multipart.start(start_params)

# Upload chunks as they become available
for i, chunk in enumerate(data_chunks):
    chunk_params = MultipartUploadChunkParams(
        session_id=session["id"],
        chunk=chunk,
        chunk_index=i
    )
    await storage.multipart.upload_part(chunk_params)

# Finish streaming upload
finish_params = FinishMultipartUploadParams(session_id=session["id"])
final_file = await storage.multipart.finish(finish_params)
```

### Bulk Upload with Mixed Sources
```python
from filezen import ZenStorageBulkItem, ZenStorageUploadOptions

# ✅ RECOMMENDED: Using dataclasses for bulk upload
bulk_items = [
    ZenStorageBulkItem(
        source="Hello, World!",  # Text
        options=ZenStorageUploadOptions(name="text.txt", mime_type="text/plain")
    ),
    ZenStorageBulkItem(
        source="data:text/plain;base64,SGVsbG8h",  # Base64
        options=ZenStorageUploadOptions(name="base64.txt")
    ),
    ZenStorageBulkItem(
        source="https://example.com/file.pdf",  # URL
        options=ZenStorageUploadOptions(name="url_file.pdf")
    ),
    ZenStorageBulkItem(
        source=b"Binary data",  # Bytes
        options=ZenStorageUploadOptions(name="binary.bin")
    )
]

uploads = await storage.bulk_upload(*bulk_items)

# ✅ DICT: Also supported for flexibility
uploads = await storage.bulk_upload(
    {
        "source": "Hello, World!",  # Text
        "options": {"name": "text.txt", "mime_type": "text/plain"}
    },
    {
        "source": "data:text/plain;base64,SGVsbG8h",  # Base64
        "options": {"name": "base64.txt"}
    },
    {
        "source": "https://example.com/file.pdf",  # URL
        "options": {"name": "url_file.pdf"}
    },
    {
        "source": b"Binary data",  # Bytes
        "options": {"name": "binary.bin"}
    }
)
```

### Manual Multipart Control with Dataclasses
```python
from filezen import StartMultipartUploadParams, MultipartUploadChunkParams, UploadMode

# Start multipart upload
start_params = StartMultipartUploadParams(
    file_name="large_file.bin",
    mime_type="application/octet-stream",
    total_size=10 * 1024 * 1024,  # 10MB
    upload_mode=UploadMode.CHUNKED,
    metadata={"source": "multipart"}
)
session = await storage.multipart.start(start_params)

# Upload chunks
chunk_size = 1024 * 1024  # 1MB chunks
with open("large_file.bin", "rb") as f:
    chunk_index = 0
    while True:
        chunk = f.read(chunk_size)
        if not chunk:
            break
        
        chunk_params = MultipartUploadChunkParams(
            session_id=session["id"],
            chunk=chunk,
            chunk_index=chunk_index
        )
        result = await storage.multipart.upload_part(chunk_params)
        
        if result.is_complete:
            print(f"Upload completed: {result.file.url}")
            break
        
        chunk_index += 1
```

## IDE Support Benefits

The SDK is designed for excellent IDE support:

- **Full Autocomplete**: All parameters and methods are fully typed
- **Type Checking**: Catch errors at development time, not runtime
- **Documentation**: Inline documentation for all parameters
- **Refactoring**: Safe refactoring with IDE support
- **Error Detection**: IDE will catch typos and invalid parameters

```python
# Your IDE will show all available parameters with documentation
options = ZenStorageUploadOptions(
    name="file.txt",        # IDE shows: name: str
    folder_id="123",        # IDE shows: folder_id: Optional[str]
    project_id="456",       # IDE shows: project_id: Optional[str]
    mime_type="text/plain", # IDE shows: mime_type: Optional[str]
    metadata={}             # IDE shows: metadata: Optional[Dict[str, Any]]
)
```

## Error Handling

The server includes comprehensive error handling for:

- **Invalid requests**: Missing files, invalid JSON, malformed data
- **File validation**: Size limits, content type validation
- **Network errors**: URL fetch failures, connection timeouts
- **SDK errors**: API failures, authentication issues
- **Upload errors**: Interrupted uploads, corrupted data
- **Metadata errors**: Invalid JSON, schema validation

All errors return appropriate HTTP status codes with descriptive messages.

```python
from filezen import ZenError, ZenUploadError

try:
    options = ZenStorageUploadOptions(name="test.txt")
    upload = await storage.upload(
        "https://invalid-url.com/file.txt",
        options
    )
except ZenError as e:
    print(f"Upload failed: {e}")
    print(f"Error code: {e.code}")
    print(f"Error message: {e.message}")
```

## File Size Limits

- **Single file upload**: 100MB maximum
- **Bulk upload**: Up to 10 files, 100MB each
- **URL upload**: No size limit (depends on source and streaming capability)
- **Base64 upload**: Limited by available memory
- **Text upload**: No specific limit (reasonable text sizes)
- **Streaming upload**: No size limit (chunks processed incrementally)

## Event Tracking

The server includes comprehensive event tracking:

```python
class UploadEventListener(ZenUploadListener):
    def on_upload_start(self, upload):
        print(f"🚀 Upload started: {upload.name}")
    
    def on_upload_progress(self, upload, progress: ZenProgress):
        if progress.percent:
            print(f"📊 Progress: {upload.name} - {progress.percent:.1f}%")
    
    def on_upload_complete(self, upload):
        print(f"✅ Upload completed: {upload.name} -> {upload.file.url}")
    
    def on_upload_error(self, upload, error):
        print(f"❌ Upload error: {upload.name} -> {error}")
```

## Advanced Features

### Flexible API Styles
The SDK supports three parameter styles:

1. **Dataclasses**: Best for IDE support and type checking (recommended)
2. **Keyword arguments**: Most concise for simple cases
3. **Dictionaries**: Familiar to Python developers

### Metadata Support
Rich metadata can be attached to all upload types:

```python
metadata = {
    "author": "John Doe",
    "version": "1.0",
    "tags": ["important", "document"],
    "created_by": "api",
    "project": "website_redesign"
}
```

### Mixed Source Types
Bulk uploads can handle different source types in a single request:

- **Bytes**: Raw binary data
- **Text**: Plain text content
- **URLs**: Remote file URLs
- **Base64**: Encoded data (with or without data URL prefix)

## Development

### Features
- **FastAPI**: Modern, fast web framework with automatic API documentation
- **Async Support**: Full async/await support for high performance
- **Type Safety**: Complete type hints and validation with Pydantic
- **Hot Reload**: Development server with automatic restarts
- **Comprehensive Error Handling**: Detailed error messages and logging
- **CORS Support**: Configured for local development
- **Interactive Documentation**: Swagger UI at `/docs`

### API Documentation
Visit `http://localhost:8000/docs` for interactive API documentation with:
- Complete endpoint documentation
- Request/response schemas
- Interactive testing interface
- Authentication examples

## Production Considerations

### Security
- Configure proper CORS settings for production
- Add authentication and authorization
- Validate file types and content
- Implement rate limiting

### Performance
- Use production ASGI server (uvicorn with gunicorn)
- Configure appropriate file size limits
- Implement caching strategies
- Monitor upload performance

### Monitoring
- Set up proper logging and monitoring
- Track upload success rates
- Monitor API response times
- Set up alerts for failures

## Environment Variables

```env
# Required
FILEZEN_API_KEY=your_filezen_api_key_here

# Optional
FILEZEN_API_URL=https://api.filezen.dev  # Default API URL
DEBUG=true  # Enable debug logging
```

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure `FILEZEN_API_KEY` is set correctly
2. **File Size Limits**: Check FastAPI and FileZen file size limits
3. **CORS Issues**: Configure CORS properly for your frontend
4. **Memory Issues**: Use `keep_uploads: false` for server usage
5. **Network Timeouts**: Increase timeout for large URL uploads
6. **Type Errors**: Use dataclasses for full IDE support and type checking

### Debug Mode
Enable debug logging with `DEBUG=true`