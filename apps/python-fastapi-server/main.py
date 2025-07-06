#!/usr/bin/env python3
"""
FileZen Python FastAPI Server Example

A complete FastAPI server demonstrating all FileZen Python SDK features.
"""

from pathlib import Path
from typing import List, Optional, Dict, Any

import httpx
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from contextlib import asynccontextmanager
# Import FileZen SDK
from filezen import ZenStorage, ZenError, ZenFile, ZenUploadListener, ZenStorageUploadOptions, ZenStorageBulkItem, \
    ZenProgress, to_dataclass

# Load environment variables
load_dotenv()

# Global storage instance
storage: Optional[ZenStorage] = None


# Global event listener for upload tracking
class UploadEventListener(ZenUploadListener):
    """Upload event listener for tracking and logging."""

    def __init__(self):
        self.uploads: List[Dict[str, Any]] = []

    def on_upload_start(self, upload):
        print(f"🚀 Upload started: {upload.name}")
        self.uploads.append({
            "id": upload.local_id,
            "name": upload.name,
            "status": "uploading",
            "progress": 0
        })

    def on_upload_progress(self, upload, progress):
        print(f"📊 Upload progress: {upload.name} - {progress.percent}%")
        # Update progress in uploads list
        for u in self.uploads:
            if u["id"] == upload.local_id:
                u["progress"] = progress.percent or 0
                break

    def on_upload_complete(self, upload):
        print(f"✅ Upload completed: {upload.name}")
        # Update status in uploads list
        for u in self.uploads:
            if u["id"] == upload.local_id:
                u["status"] = "completed"
                u["file_id"] = upload.file.id if upload.file else None
                break

    def on_upload_error(self, upload, error):
        print(f"❌ Upload error: {upload.name} - {error}")
        # Update status in uploads list
        for u in self.uploads:
            if u["id"] == upload.local_id:
                u["status"] = "error"
                u["error"] = str(error)
                break


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for FastAPI."""
    # Startup
    global storage
    print("🚀 FileZen Python FastAPI Server starting...")
    print(f"📁 API Documentation: http://localhost:8000/docs")
    print(f"🌐 Interactive Interface: http://localhost:8000")

    # Initialize storage with event listener
    storage = ZenStorage()

    # Add event listener
    storage.add_listener(UploadEventListener())

    yield

    # Shutdown
    if storage:
        await storage.close()
    print("👋 FileZen Python FastAPI Server shutting down...")


# Create FastAPI app with lifespan
app = FastAPI(
    title="FileZen Python FastAPI Server",
    description="A complete FastAPI server demonstrating all FileZen Python SDK features",
    version="2.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")


# Pydantic models for request/response
class UrlUploadRequest(BaseModel):
    """Request model for URL upload."""
    url: str
    name: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class Base64UploadRequest(BaseModel):
    """Request model for base64 upload."""
    data: str = Field(..., description="Base64 encoded data (with or without data URL prefix)")
    name: str = Field(..., description="Filename for the uploaded file")
    metadata: Optional[Dict[str, Any]] = None


class TextUploadRequest(BaseModel):
    """Request model for text upload."""
    text: str = Field(..., description="Text content to upload")
    name: str = Field(..., description="Filename for the uploaded file")
    mime_type: Optional[str] = Field(default="text/plain", description="MIME type")
    metadata: Optional[Dict[str, Any]] = None


class MultipartStartRequest(BaseModel):
    """Request model for starting multipart upload."""
    file_name: str
    mime_type: str
    total_size: Optional[int] = None
    upload_mode: Optional[str] = Field(default="multipart", description="Upload mode: 'multipart' or 'streaming'")
    metadata: Optional[Dict[str, Any]] = None


class MultipartUploadPartRequest(BaseModel):
    """Request model for uploading multipart chunk."""
    session_id: str
    chunk_index: int


class MultipartFinishRequest(BaseModel):
    """Request model for finishing multipart upload."""
    session_id: str


class SignedUrlRequest(BaseModel):
    """Request model for signed URL generation."""
    file_key: str
    expires_in: Optional[int] = 3600


class DeleteRequest(BaseModel):
    """Request model for file deletion."""
    url: str


class SignedUrlResponse(BaseModel):
    """Signed URL response model."""
    signed_url: str
    expires_in: int


class MultipartSessionResponse(BaseModel):
    """Multipart session response model."""
    id: str
    file_name: str
    mime_type: str
    total_size: Optional[int]
    upload_mode: str
    metadata: Optional[Dict[str, Any]]


class MultipartChunkResponse(BaseModel):
    """Multipart chunk response model."""
    chunk_index: int
    is_complete: bool
    file: Optional[ZenFile] = None


@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the interactive test interface."""
    html_path = Path(__file__).parent / "static" / "index.html"
    if html_path.exists():
        return html_path.read_text()
    else:
        return """
        <html>
            <head><title>FileZen Python FastAPI Server</title></head>
            <body>
                <h1>FileZen Python FastAPI Server</h1>
                <p>Server is running! Check the <a href="/docs">API documentation</a>.</p>
                <h2>Available Endpoints:</h2>
                <ul>
                    <li><a href="/docs">API Documentation</a></li>
                    <li><a href="/api/files/upload">File Upload</a></li>
                    <li><a href="/api/files/upload-with-metadata">Upload with Metadata</a></li>
                    <li><a href="/api/files/upload-from-url">URL Upload</a></li>
                    <li><a href="/api/files/upload-from-base64">Base64 Upload</a></li>
                    <li><a href="/api/files/upload-text">Text Upload</a></li>
                    <li><a href="/api/files/streaming-upload">Streaming Upload</a></li>
                    <li><a href="/api/files/multipart/start">Multipart Upload</a></li>
                </ul>
            </body>
        </html>
        """


@app.post("/api/files/upload", response_model=ZenFile)
async def upload_file(file: UploadFile = File(...)):
    """Upload a single file (basic upload)."""
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    # Read file content
    content = await file.read()

    # Check file size (100MB limit)
    if len(content) > 100 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 100MB)")

    try:
        # Upload file using FileZen SDK - demonstrating dict style
        upload = await storage.upload(content, {
            "name": file.filename,
            "mime_type": file.content_type or "application/octet-stream",
        })

        return upload.file

    except ZenError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.post("/api/files/upload-with-metadata", response_model=ZenFile)
async def upload_file_with_metadata(
        file: UploadFile = File(...),
        metadata: Optional[str] = Form(None),
        project_id: Optional[str] = Form(None),
        folder_id: Optional[str] = Form(None)
):
    """Upload a single file with metadata support."""
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    # Read file content
    content = await file.read()

    # Check file size (100MB limit)
    if len(content) > 100 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 100MB)")

    try:
        # Parse metadata JSON if provided
        parsed_metadata = {}
        if metadata:
            import json
            try:
                parsed_metadata = json.loads(metadata)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid metadata JSON")

        # Upload file using FileZen SDK - demonstrating kwargs style
        upload = await storage.upload(
            content,
            name=file.filename,
            mime_type=file.content_type or "application/octet-stream",
            metadata=parsed_metadata,
            project_id=project_id,
            folder_id=folder_id
        )

        return upload.file

    except ZenError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.post("/api/files/bulk-upload", response_model=List[ZenFile])
async def bulk_upload_files(files: List[UploadFile] = File(...)):
    """Upload multiple files."""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Too many files (max 10)")

    # Prepare upload items - demonstrating mixed source types
    upload_items = []
    for i, file in enumerate(files):
        content = await file.read()

        # Check file size (100MB limit)
        if len(content) > 100 * 1024 * 1024:
            raise HTTPException(status_code=413, detail=f"File {file.filename} too large (max 100MB)")

        upload_items.append({
            "source": content,
            "options": {
                "name": file.filename,
                "mime_type": file.content_type or "application/octet-stream",
                "metadata": {
                    "batch_id": f"bulk_upload_{i}",
                    "upload_type": "bulk",
                    "file_index": str(i),
                    "total_files": str(len(files))
                }
            }
        })

    try:
        # Perform bulk upload
        uploads = await storage.bulk_upload(*upload_items)

        # Return file objects
        return [upload.file for upload in uploads if upload.file]

    except ZenError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk upload failed: {str(e)}")


@app.post("/api/files/upload-from-url", response_model=ZenFile)
async def upload_from_url(request: UrlUploadRequest):
    """Upload a file from URL using SDK's built-in URL support."""
    if not request.url:
        raise HTTPException(status_code=400, detail="URL is required")

    try:
        # Download the URL content first, then upload as bytes to avoid streaming issues
        async with httpx.AsyncClient() as client:
            response = await client.get(request.url)
            response.raise_for_status()
            content = response.content

            # Determine MIME type from response headers
            content_type = response.headers.get("content-type", "application/octet-stream")

            # Upload the downloaded content
            upload = await storage.upload(
                content,
                name=request.name or "url_download",
                mime_type=content_type,
                metadata=request.metadata or {"source": "url", "original_url": request.url}
            )

        return upload.file

    except ZenError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"URL upload failed: {str(e)}")


@app.post("/api/files/upload-from-base64", response_model=ZenFile)
async def upload_from_base64(request: Base64UploadRequest):
    """Upload a file from base64 encoded data."""
    try:
        # Upload from base64 using SDK
        upload = await storage.upload(
            request.data,
            name=request.name,
            metadata=request.metadata or {"source": "base64", "encoding": "base64"}
        )

        return upload.file

    except ZenError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Base64 upload failed: {str(e)}")


@app.post("/api/files/upload-text", response_model=ZenFile)
async def upload_text(request: TextUploadRequest):
    """Upload text content as a file."""
    try:
        # Upload text using SDK - convert to bytes explicitly to avoid auto-detection issues
        text_bytes = request.text.encode('utf-8')
        upload = await storage.upload(
            text_bytes,
            name=request.name,
            mime_type=request.mime_type,
            metadata=request.metadata
        )

        return upload.file

    except ZenError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text upload failed: {str(e)}")


@app.post("/api/files/streaming-upload", response_model=ZenFile)
async def streaming_upload(
        background_tasks: BackgroundTasks,
        chunk_size: int = Form(default=1024 * 1024),  # 1MB chunks
        total_chunks: int = Form(default=5),  # Simulate 5 chunks
        filename: str = Form(default="streaming_file.bin")
):
    """Demonstrate streaming upload - simplified to avoid complex multipart issues."""
    try:
        # Generate sample streaming data by combining all chunks
        streaming_data = b""
        for chunk_index in range(total_chunks):
            # Generate sample chunk data
            chunk_data = f"Streaming chunk {chunk_index} data - {'x' * (chunk_size // 2)}\n".encode()
            streaming_data += chunk_data

        # Upload the generated streaming data as a single file
        upload = await storage.upload(
            streaming_data,
            name=filename,
            mime_type="application/octet-stream",
            metadata={
                "source": "streaming_demo",
                "chunk_size": str(chunk_size),
                "total_chunks": str(total_chunks),
                "total_size": str(len(streaming_data))
            }
        )

        return upload.file

    except ZenError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Streaming upload failed: {str(e)}")


@app.post("/api/files/multipart/start", response_model=MultipartSessionResponse)
async def start_multipart_upload(request: MultipartStartRequest):
    """Start a multipart upload session."""
    try:
        # Start multipart upload - demonstrating kwargs style
        session = await storage.multipart.start(
            file_name=request.file_name,
            mime_type=request.mime_type,
            total_size=request.total_size,
            upload_mode=request.upload_mode,
            metadata=request.metadata or {"source": "multipart", "mode": request.upload_mode,
                                          "file_size": str(request.total_size) if request.total_size else "unknown"}
        )

        return MultipartSessionResponse(
            id=session["id"],
            file_name=request.file_name,
            mime_type=request.mime_type,
            total_size=request.total_size,
            upload_mode=request.upload_mode,
            metadata=request.metadata
        )

    except ZenError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start multipart upload: {str(e)}")


@app.post("/api/files/multipart/upload-part", response_model=MultipartChunkResponse)
async def upload_multipart_chunk(
        session_id: str = Form(...),
        chunk_index: int = Form(...),
        chunk: UploadFile = File(...)
):
    """Upload a chunk for multipart upload."""
    try:
        # Read chunk data
        chunk_data = await chunk.read()

        # Upload chunk - demonstrating dict style
        result = await storage.multipart.upload_part({
            "session_id": session_id,
            "chunk": chunk_data,
            "chunk_index": chunk_index
        })

        return MultipartChunkResponse(
            chunk_index=chunk_index,
            is_complete=result.is_complete,
            file=result.file if result.is_complete else None
        )

    except ZenError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload chunk: {str(e)}")


@app.post("/api/files/multipart/finish", response_model=ZenFile)
async def finish_multipart_upload(request: MultipartFinishRequest):
    """Finish a multipart upload session."""
    try:
        # Finish multipart upload - demonstrating direct parameter style
        final_file = await storage.multipart.finish(request.session_id)

        return final_file

    except ZenError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to finish multipart upload: {str(e)}")


@app.post("/api/files/generate-signed-url", response_model=SignedUrlResponse)
async def generate_signed_url(request: SignedUrlRequest):
    """Generate a signed URL for upload."""
    if not request.file_key:
        raise HTTPException(status_code=400, detail="file_key is required")

    try:
        # Generate signed URL using FileZen SDK
        signed_url = storage.generate_signed_url({
            "path": "/files/upload",
            "file_key": request.file_key,
            "expires_in": request.expires_in,
        })

        return SignedUrlResponse(
            signed_url=signed_url,
            expires_in=request.expires_in,
        )

    except ZenError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate signed URL: {str(e)}")


@app.delete("/api/files/delete")
async def delete_file(request: DeleteRequest):
    """Delete a file by URL."""
    if not request.url:
        raise HTTPException(status_code=400, detail="File URL is required")

    try:
        # Delete file using FileZen SDK
        success = await storage.delete_by_url(request.url)

        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete file")

        return {"message": "File deleted successfully"}

    except ZenError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")


@app.get("/api/demo/mixed-upload", response_model=List[ZenFile])
async def demo_mixed_upload():
    """Demonstrate mixed source types in bulk upload."""
    try:
        # Create sample data for different source types
        sample_text = "Hello, World! This is a text file."
        sample_base64 = "data:text/plain;base64,SGVsbG8gZnJvbSBiYXNlNjQh"  # "Hello from base64!"
        sample_url = "https://httpbin.org/robots.txt"
        sample_bytes = b"Binary data content"

        # Bulk upload with mixed sources
        uploads = await storage.bulk_upload(
            {
                "source": sample_text,
                "options": {
                    "name": "text_file.txt",
                    "mime_type": "text/plain",
                    "metadata": {"source": "text", "demo": "true", "type": "plain_text"}
                }
            },
            {
                "source": sample_base64,
                "options": {
                    "name": "base64_file.txt",
                    "metadata": {"source": "base64", "demo": "true", "encoding": "base64"}
                }
            },
            {
                "source": sample_url,
                "options": {
                    "name": "url_file.txt",
                    "metadata": {"source": "url", "demo": "true", "origin": "httpbin"}
                }
            },
            {
                "source": sample_bytes,
                "options": {
                    "name": "binary_file.bin",
                    "mime_type": "application/octet-stream",
                    "metadata": {"source": "bytes", "demo": "true", "type": "binary"}
                }
            }
        )

        return [upload.file for upload in uploads if upload.file]

    except ZenError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mixed upload demo failed: {str(e)}")


@app.get("/status")
async def get_status():
    """Get upload status."""
    return {
        "uploads": UploadEventListener().uploads,
        "active_count": len(storage.active_uploads) if storage else 0,
        "total_count": len(storage.get_uploads) if storage else 0
    }


if __name__ == "__main__":
    import uvicorn

    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
