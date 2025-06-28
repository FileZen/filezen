import { ZenStorage } from '@filezen/js';
import { 
  defineEventHandler, 
  readMultipartFormData, 
  readBody,
  createError,
  Router
} from 'h3';

// Initialize FileZen SDK
const zenStorage = new ZenStorage({
  keepUploads: false, // Recommended for server-side usage
});

interface UploadFromUrlBody {
  url: string;
  name?: string;
}

interface GenerateSignedUrlBody {
  fileKey: string;
  expiresIn?: number;
}

interface DeleteFileBody {
  url: string;
}

export function fileUploadRoutes(router: Router) {
  /**
   * Upload a single file
   * POST /api/files/upload
   */
  router.post('/api/files/upload', defineEventHandler(async (event: any) => {
    try {
      const formData = await readMultipartFormData(event);
      
      if (!formData || formData.length === 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'No file provided'
        });
      }

      // Find the file field
      const fileField = formData.find((field: any) => field.name === 'file' && field.filename);
      
      if (!fileField || !fileField.data) {
        throw createError({
          statusCode: 400,
          statusMessage: 'No file provided'
        });
      }

      // Upload file using FileZen SDK
      const upload = await zenStorage.upload(fileField.data, {
        name: fileField.filename || 'unnamed-file',
        mimeType: fileField.type || 'application/octet-stream',
      });

      if (upload.error) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Upload failed',
          data: { message: upload.error.message }
        });
      }

      return {
        success: true,
        file: upload.file,
      };
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Upload failed',
        data: { message: error.message }
      });
    }
  }));

  /**
   * Upload multiple files
   * POST /api/files/bulk-upload
   */
  router.post('/api/files/bulk-upload', defineEventHandler(async (event: any) => {
    try {
      const formData = await readMultipartFormData(event);
      
      if (!formData || formData.length === 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'No files provided'
        });
      }

      // Find all file fields
      const fileFields = formData.filter((field: any) => 
        (field.name === 'files' || field.name === 'file') && field.filename && field.data
      );

      if (fileFields.length === 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'No files provided'
        });
      }

      // Prepare upload items for bulk upload
      const uploadItems = fileFields.map((field: any) => ({
        source: field.data!,
        options: {
          name: field.filename || 'unnamed-file',
          mimeType: field.type || 'application/octet-stream',
        },
      }));

      // Perform bulk upload
      const uploads = await zenStorage.bulkUpload(...uploadItems);

      // Check for any upload errors
      const failedUploads = uploads.filter(upload => upload.error);
      if (failedUploads.length > 0) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Some uploads failed',
          data: {
            message: `${failedUploads.length} out of ${uploads.length} uploads failed`,
            failures: failedUploads.map(upload => ({
              name: upload.name,
              error: upload.error?.message
            }))
          }
        });
      }

      return {
        success: true,
        files: uploads.map((upload) => upload.file),
      };
    } catch (error: any) {
      console.error('Bulk upload error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Bulk upload failed',
        data: { message: error.message }
      });
    }
  }));

  /**
   * Upload file from URL
   * POST /api/files/upload-from-url
   */
  router.post('/api/files/upload-from-url', defineEventHandler(async (event: any) => {
    try {
      const body = await readBody<UploadFromUrlBody>(event);
      const { url, name } = body;

      if (!url) {
        throw createError({
          statusCode: 400,
          statusMessage: 'URL is required'
        });
      }

      // Fetch file from URL
      const response = await fetch(url);
      if (!response.ok) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Failed to fetch file from URL'
        });
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType =
        response.headers.get('content-type') || 'application/octet-stream';

      // Upload file using FileZen SDK
      const upload = await zenStorage.upload(buffer, {
        name: name || `file-${Date.now()}`,
        mimeType: contentType,
      });

      if (upload.error) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Upload failed',
          data: { message: upload.error.message }
        });
      }

      return {
        success: true,
        file: upload.file,
      };
    } catch (error: any) {
      console.error('URL upload error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'URL upload failed',
        data: { message: error.message }
      });
    }
  }));

  /**
   * Generate signed URL for upload
   * POST /api/files/generate-signed-url
   */
  router.post('/api/files/generate-signed-url', defineEventHandler(async (event: any) => {
    try {
      const body = await readBody<GenerateSignedUrlBody>(event);
      const { fileKey, expiresIn } = body;

      if (!fileKey) {
        throw createError({
          statusCode: 400,
          statusMessage: 'fileKey is required'
        });
      }

      // Generate signed URL using FileZen SDK
      const signedUrl = zenStorage.generateSignedUrl({
        path: '/files/upload', // or /files/chunk-upload/initialize for multipart upload
        fileKey,
        expiresIn: expiresIn || 3600, // Default 1 hour
      });

      return {
        success: true,
        signedUrl,
        expiresIn: expiresIn || 3600,
      };
    } catch (error: any) {
      console.error('Generate signed URL error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to generate signed URL',
        data: { message: error.message }
      });
    }
  }));

  /**
   * Delete file by URL
   * DELETE /api/files/delete
   */
  router.delete('/api/files/delete', defineEventHandler(async (event: any) => {
    try {
      const body = await readBody<DeleteFileBody>(event);
      const { url } = body;

      if (!url) {
        throw createError({
          statusCode: 400,
          statusMessage: 'File URL is required'
        });
      }

      await zenStorage.deleteByUrl(url);

      return {
        success: true,
        message: 'File deleted successfully',
      };
    } catch (error: any) {
      console.error('Delete error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Delete failed',
        data: { message: error.message }
      });
    }
  }));
} 
