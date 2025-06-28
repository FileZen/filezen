// Load environment variables (for production/manual runs)
import dotenv from 'dotenv';
dotenv.config();

import { 
  createApp, 
  createRouter, 
  defineEventHandler,
  toNodeListener
} from 'h3';
import { createServer } from 'http';
import path from 'path';
import { fileUploadRoutes } from './fileUpload';

// Create H3 app instance
export const app = createApp();

// Create router for API routes
const apiRouter = createRouter();

// Register file upload routes
fileUploadRoutes(apiRouter);

// Mount API router
app.use(apiRouter);

// Serve the test page at root
app.use('/', defineEventHandler(async (event: any) => {
  const url = event.node.req.url;
  
  // Handle root path - serve index.html
  if (url === '/') {
    const fs = await import('fs');
    const indexPath = path.join(__dirname, '../public/index.html');
    try {
      const content = await fs.promises.readFile(indexPath, 'utf-8');
      event.node.res.setHeader('Content-Type', 'text/html');
      return content;
    } catch (error) {
      return '<h1>Welcome to FileZen H3 Server</h1><p>Test interface not found</p>';
    }
  }
  
  // Handle static files from public directory
  if (url && !url.startsWith('/api/')) {
    const fs = await import('fs');
    const filePath = path.join(__dirname, '../public', url);
    
    try {
      const stats = await fs.promises.stat(filePath);
      
      // Don't serve directories
      if (stats.isDirectory()) {
        return null; // Let it fall through to 404
      }
      
      const content = await fs.promises.readFile(filePath);
      
      // Set appropriate content type
      const ext = path.extname(filePath).toLowerCase();
      const contentTypes: { [key: string]: string } = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
      };
      
      event.node.res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
      return content;
    } catch (error) {
      // File not found, continue to next handler
      return null;
    }
  }
}));

// Create HTTP server and start listening
const PORT = Number(process.env.PORT) || 3003;

// Start server if this is the main module
if (require.main === module) {
  const server = createServer(toNodeListener(app));
  
  server.listen(PORT, () => {
    console.log(`🚀 FileZen H3 server running on port ${PORT}`);
    console.log(`🌐 Test page: http://localhost:${PORT}/`);
    console.log(`📤 File upload endpoint: http://localhost:${PORT}/api/files/upload`);
  });
} 