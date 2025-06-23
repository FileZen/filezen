import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileUploadRoutes } from './fileUpload';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/files', fileUploadRoutes);

// Serve the test page at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'Something went wrong',
    });
  },
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FileZen Node.js server running on port ${PORT}`);
  console.log(`🌐 Test page: http://localhost:${PORT}/`);
  console.log(
    `📤 File upload endpoint: http://localhost:${PORT}/api/files/upload`,
  );
});
