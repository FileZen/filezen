import { ZenStorage } from '@filezen/js';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

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

export async function fileUploadRoutes(fastify: FastifyInstance) {
  /**
   * Upload a single file
   * POST /api/files/upload
   */
  fastify.post('/upload', async (request: any, reply: FastifyReply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ error: 'No file provided' });
      }

      // Convert file stream to buffer
      const buffer = await data.toBuffer();

      // Upload file using FileZen SDK
      const upload = await zenStorage.upload(buffer, {
        name: data.filename,
        mimeType: data.mimetype,
      });

      if (upload.error) {
        return reply.status(500).send({
          error: 'Upload failed',
          message: upload.error.message,
        });
      }

      return reply.send({
        success: true,
        file: upload.file,
      });
    } catch (error: any) {
      fastify.log.error('Upload error:', error);
      return reply.status(500).send({
        error: 'Upload failed',
        message: error.message,
      });
    }
  });

  /**
   * Upload multiple files
   * POST /api/files/bulk-upload
   */
  fastify.post('/bulk-upload', async (request: any, reply: FastifyReply) => {
    try {
      const parts = request.files();
      const files: Array<{ buffer: Buffer; filename: string; mimetype: string }> = [];

      for await (const part of parts) {
        if (part.type === 'file') {
          const buffer = await part.toBuffer();
          files.push({
            buffer,
            filename: part.filename,
            mimetype: part.mimetype,
          });
        }
      }

      if (files.length === 0) {
        return reply.status(400).send({ error: 'No files provided' });
      }

      // Prepare upload items for bulk upload
      const uploadItems = files.map((file) => ({
        source: file.buffer,
        options: {
          name: file.filename,
          mimeType: file.mimetype,
        },
      }));

      // Perform bulk upload
      const uploads = await zenStorage.bulkUpload(...uploadItems);

      // Check for any upload errors
      const failedUploads = uploads.filter(upload => upload.error);
      if (failedUploads.length > 0) {
        return reply.status(500).send({
          error: 'Some uploads failed',
          message: `${failedUploads.length} out of ${uploads.length} uploads failed`,
          failures: failedUploads.map(upload => ({
            name: upload.name,
            error: upload.error?.message
          }))
        });
      }

      return reply.send({
        success: true,
        files: uploads.map((upload) => upload.file),
      });
    } catch (error: any) {
      fastify.log.error('Bulk upload error:', error);
      return reply.status(500).send({
        error: 'Bulk upload failed',
        message: error.message,
      });
    }
  });

  /**
   * Upload file from URL
   * POST /api/files/upload-from-url
   */
  fastify.post<{ Body: UploadFromUrlBody }>(
    '/upload-from-url',
    async (request: FastifyRequest<{ Body: UploadFromUrlBody }>, reply: FastifyReply) => {
      try {
        const { url, name } = request.body;

        if (!url) {
          return reply.status(400).send({ error: 'URL is required' });
        }

        // Fetch file from URL
        const response = await fetch(url);
        if (!response.ok) {
          return reply.status(400).send({ error: 'Failed to fetch file from URL' });
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
          return reply.status(500).send({
            error: 'Upload failed',
            message: upload.error.message,
          });
        }

        return reply.send({
          success: true,
          file: upload.file,
        });
      } catch (error: any) {
        fastify.log.error('URL upload error:', error);
        return reply.status(500).send({
          error: 'URL upload failed',
          message: error.message,
        });
      }
    },
  );

  /**
   * Generate signed URL for upload
   * POST /api/files/generate-signed-url
   */
  fastify.post<{ Body: GenerateSignedUrlBody }>(
    '/generate-signed-url',
    async (request: FastifyRequest<{ Body: GenerateSignedUrlBody }>, reply: FastifyReply) => {
      try {
        const { fileKey, expiresIn } = request.body;

        if (!fileKey) {
          return reply.status(400).send({ error: 'fileKey is required' });
        }

        // Generate signed URL using FileZen SDK
        const signedUrl = zenStorage.generateSignedUrl({
          path: '/files/upload', // or /files/chunk-upload/initialize for multipart upload
          fileKey,
          expiresIn: expiresIn || 3600, // Default 1 hour
        });

        return reply.send({
          success: true,
          signedUrl,
          expiresIn: expiresIn || 3600,
        });
      } catch (error: any) {
        fastify.log.error('Generate signed URL error:', error);
        return reply.status(500).send({
          error: 'Failed to generate signed URL',
          message: error.message,
        });
      }
    },
  );

  /**
   * Delete file by URL
   * DELETE /api/files/delete
   */
  fastify.delete<{ Body: DeleteFileBody }>(
    '/delete',
    async (request: FastifyRequest<{ Body: DeleteFileBody }>, reply: FastifyReply) => {
      try {
        const { url } = request.body;

        if (!url) {
          return reply.status(400).send({ error: 'File URL is required' });
        }

        await zenStorage.deleteByUrl(url);

        return reply.send({
          success: true,
          message: 'File deleted successfully',
        });
      } catch (error: any) {
        fastify.log.error('Delete error:', error);
        return reply.status(500).send({
          error: 'Delete failed',
          message: error.message,
        });
      }
    },
  );
} 