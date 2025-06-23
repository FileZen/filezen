import { ZenStorage } from '@filezen/js';
import express from 'express';
import multer from 'multer';

const router = express.Router();

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Initialize FileZen SDK
const zenStorage = new ZenStorage({
  keepUploads: false, // Recommended for server-side usage
});

/**
 * Upload a single file
 * POST /api/files/upload
 */
router.post(
  '/upload',
  upload.single('file'),
  async (req: express.Request, res: express.Response) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      // Upload file using FileZen SDK
      const upload = await zenStorage.upload(file.buffer, {
        name: file.originalname,
        mimeType: file.mimetype,
      });

      res.json({
        success: true,
        file: upload.file,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({
        error: 'Upload failed',
        message: error.message,
      });
    }
  },
);

/**
 * Upload multiple files
 * POST /api/files/bulk-upload
 */
router.post(
  '/bulk-upload',
  upload.array('files', 10),
  async (req: express.Request, res: express.Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No files provided' });
        return;
      }

      // Prepare upload items for bulk upload
      const uploadItems = files.map((file) => ({
        source: file.buffer,
        options: {
          name: file.originalname,
          mimeType: file.mimetype,
        },
      }));

      // Perform bulk upload
      const uploads = await zenStorage.bulkUpload(...uploadItems);

      res.json({
        success: true,
        files: uploads.map((upload) => upload.file),
      });
    } catch (error: any) {
      console.error('Bulk upload error:', error);
      res.status(500).json({
        error: 'Bulk upload failed',
        message: error.message,
      });
    }
  },
);

/**
 * Upload file from URL
 * POST /api/files/upload-from-url
 */
router.post(
  '/upload-from-url',
  async (req: express.Request, res: express.Response) => {
    try {
      const { url, name } = req.body;

      if (!url) {
        res.status(400).json({ error: 'URL is required' });
        return;
      }

      // Fetch file from URL
      const response = await fetch(url);
      if (!response.ok) {
        res.status(400).json({ error: 'Failed to fetch file from URL' });
        return;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType =
        response.headers.get('content-type') || 'application/octet-stream';

      // Upload file using FileZen SDK
      const upload = await zenStorage.upload(buffer, {
        name: name || `file-${Date.now()}`,
        mimeType: contentType,
      });

      res.json({
        success: true,
        file: upload.file,
      });
    } catch (error: any) {
      console.error('URL upload error:', error);
      res.status(500).json({
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
router.post(
  '/generate-signed-url',
  async (req: express.Request, res: express.Response) => {
    try {
      const { fileKey, expiresIn } = req.body;

      if (!fileKey) {
        res.status(400).json({ error: 'fileKey is required' });
        return;
      }

      // Generate signed URL using FileZen SDK
      const signedUrl = zenStorage.generateSignedUrl({
        path: '/files/upload', // or /files/chunk-upload/initialize for multipart upload
        fileKey,
        expiresIn: expiresIn || 3600, // Default 1 hour
      });

      res.json({
        success: true,
        signedUrl,
        expiresIn: expiresIn || 3600,
      });
    } catch (error: any) {
      console.error('Generate signed URL error:', error);
      res.status(500).json({
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
router.delete(
  '/delete',
  async (req: express.Request, res: express.Response) => {
    try {
      const { url } = req.body;

      if (!url) {
        res.status(400).json({ error: 'File URL is required' });
        return;
      }

      await zenStorage.deleteByUrl(url);

      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      res.status(500).json({
        error: 'Delete failed',
        message: error.message,
      });
    }
  },
);

export { router as fileUploadRoutes };
