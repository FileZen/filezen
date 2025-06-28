import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import path from 'path';
import { fileUploadRoutes } from './fileUpload';

const fastify = Fastify({
  logger: true,
});

const PORT = Number(process.env.PORT) || 3002;

const start = async () => {
  try {
    // Register CORS plugin
    await fastify.register(require('@fastify/cors'), {
      origin: true,
    });

    // Register static files plugin
    await fastify.register(require('@fastify/static'), {
      root: path.join(__dirname, '../public'),
      prefix: '/',
    });

    // Register multipart plugin for file uploads
    await fastify.register(require('@fastify/multipart'), {
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
      },
    });

    // Register file upload routes
    await fastify.register(fileUploadRoutes, { prefix: '/api/files' });

    // Serve the test page at root
    fastify.get('/', async (request: FastifyRequest, reply: any) => {
      return reply.sendFile('index.html');
    });

    // Global error handler
    fastify.setErrorHandler(async (error: Error, request: FastifyRequest, reply: FastifyReply) => {
      fastify.log.error(error);
      reply.status(500).send({
        error: 'Internal server error',
        message:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Something went wrong',
      });
    });

    // Start server
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 FileZen Fastify server running on port ${PORT}`);
    console.log(`🌐 Test page: http://localhost:${PORT}/`);
    console.log(
      `📤 File upload endpoint: http://localhost:${PORT}/api/files/upload`,
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start(); 