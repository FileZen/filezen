# FileZen NestJS Example

This is an example project demonstrating how to use FileZen with NestJS for file uploads, including URL presigning for direct client-side uploads.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file in the root directory and add your FileZen API key:
   ```
   FILEZEN_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run start:dev --workspace=apps/nestjs-app
   ```

## Running the app

```bash
# development
$ npm run start --workspace=apps/nestjs-app

# watch mode
$ npm run start:dev --workspace=apps/nestjs-app

# production mode
$ npm run start:prod --workspace=apps/nestjs-app
```

## Demo Features

### 🌐 Web Demo Interface

Visit `http://localhost:3100` to access the interactive demo that showcases:

- **URL Presigning**: Generate signed URLs for direct file uploads
- **Direct Upload**: Upload files directly to FileZen, bypassing your server
- **Server-Side Upload**: Test server-side file uploads using the NestJS controller
- **Real-time Feedback**: See the upload process step by step

### 🔐 URL Presigning API

The demo includes a built-in controller at `POST /upload/sign` that:

- Generates signed URLs for direct uploads
- Supports custom file names and expiration times
- Can be extended with custom middleware for authentication

**Example API Usage:**
```bash
curl -X POST http://localhost:3100/upload/sign \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/files/upload",
    "fileKey": "my-file.jpg",
    "expiresIn": 3600
  }'
```

### 📤 Server-Side Upload

Test server-side file uploads using the provided test script or the web interface:

```bash
# Make sure the server is running first
npm run start:dev --workspace=apps/nestjs-app

# In another terminal, run the test script
node scripts/test-server-upload.js
```

**Web Interface**: Use the "Server-Side Upload" button in the demo interface at `http://localhost:3100`

## Project Structure

- [`src/app.module.ts`](./src/app.module.ts) - Main application module with FileZen integration
- [`src/app.controller.ts`](./src/app.controller.ts) - Controller for serving the demo interface
- [`src/upload.controller.ts`](./src/upload.controller.ts) - Server-side file upload controller
- [`src/main.ts`](./src/main.ts) - Application entry point
- [`public/index.html`](./public/index.html) - Interactive web demo interface
- [`scripts/test-server-upload.js`](./scripts/test-server-upload.js) - Test script for server upload

## Key Features Demonstrated

### 1. URL Presigning
- Generate signed URLs for secure direct uploads
- Customizable expiration times
- Bypass server bandwidth for large files

### 2. Direct Client Uploads
- Upload files directly to FileZen from the browser
- No file data passes through your server
- Reduced server load and bandwidth usage

### 3. Server-Side Uploads
- Upload files through the NestJS server
- Full control over the upload process
- Access to server-side validation and processing

### 4. FileZen NestJS Integration
- Seamless integration with NestJS modules
- Built-in controller for URL presigning
- Type-safe API with full TypeScript support

## Learn More

- [FileZen Documentation](https://docs.filezen.dev)
- [NestJS Documentation](https://docs.nestjs.com)
- [Discord Community](https://discord.gg/temp-link)
- [Twitter](https://twitter.com/temp-link)
