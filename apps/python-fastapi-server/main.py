#!/usr/bin/env python3
"""
FileZen Python FastAPI Server Example

A complete FastAPI server demonstrating FileZen Python SDK usage.
"""

import os
import sys
from pathlib import Path
from typing import List, Optional

import httpx
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# Load environment variables
load_dotenv()

# Add the SDK to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "sdks" / "filezen-python" / "src"))

from filezen import ZenStorage, ZenError, ZenFile

# Global storage instance
storage: Optional[ZenStorage] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for FastAPI."""
    # Startup
    global storage
    print("🚀 FileZen Python FastAPI Server starting...")
    print(f"📁 API Documentation: http://localhost:8000/docs")
    print(f"🌐 Interactive Interface: http://localhost:8000")
    
    # Initialize storage
    storage = ZenStorage({
        "keep_uploads": False,  # Recommended for server-side usage
    })
    
    yield
    
    # Shutdown
    if storage:
        await storage.close()
    print("👋 FileZen Python FastAPI Server shutting down...")


# Create FastAPI app with lifespan
app = FastAPI(
    title="FileZen Python FastAPI Server",
    description="A complete FastAPI server demonstrating FileZen Python SDK usage",
    version="1.0.0",
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
            </body>
        </html>
        """


@app.post("/api/files/upload", response_model=ZenFile)
async def upload_file(file: UploadFile = File(...)):
    """Upload a single file."""
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    # Read file content
    content = await file.read()
    
    # Check file size (100MB limit)
    if len(content) > 100 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 100MB)")

    try:
        # Upload file using FileZen SDK
        upload = await storage.upload(content, {
            "name": file.filename,
            "mime_type": file.content_type or "application/octet-stream",
        })

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

    # Prepare upload items
    upload_items = []
    for file in files:
        content = await file.read()
        
        # Check file size (100MB limit)
        if len(content) > 100 * 1024 * 1024:
            raise HTTPException(status_code=413, detail=f"File {file.filename} too large (max 100MB)")

        upload_items.append({
            "source": content,
            "options": {
                "name": file.filename,
                "mime_type": file.content_type or "application/octet-stream",
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
    """Upload a file from URL."""
    if not request.url:
        raise HTTPException(status_code=400, detail="URL is required")

    try:
        # Fetch file from URL
        async with httpx.AsyncClient() as client:
            response = await client.get(request.url)
            if not response.is_success:
                raise HTTPException(status_code=400, detail="Failed to fetch file from URL")

            content = response.content
            content_type = response.headers.get("content-type", "application/octet-stream")

        # Upload file using FileZen SDK
        upload = await storage.upload(content, {
            "name": request.name or f"file-{len(content)}",
            "mime_type": content_type,
        })

        return upload.file

    except ZenError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"URL upload failed: {str(e)}")


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


if __name__ == "__main__":
    import uvicorn
    
    # Check if API key is set
    if not os.getenv("FILEZEN_API_KEY"):
        print("❌ Please set the FILEZEN_API_KEY environment variable")
        print("Example: export FILEZEN_API_KEY='your_api_key_here'")
        sys.exit(1)
    
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 