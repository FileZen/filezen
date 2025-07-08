# @filezen/nest

A Nest.js wrapper for the FileZen JavaScript SDK, providing easy integration with Nest.js applications.

## Installation

```bash
# With npm
npm install @filezen/js @filezen/nest

# With yarn
yarn add @filezen/js @filezen/nest

# With pnpm
pnpm add @filezen/js @filezen/nest
```

## Quick Start

### 1. Import the Module

```typescript
import { Module } from '@nestjs/common';
import { FileZenModule } from '@filezen/nest';

@Module({
  imports: [
    // The FileZenModule will automatically pick up the FILEZEN_API_KEY from environment variables.
    FileZenModule.forRoot(),
  ],
})
export class AppModule {}
```

**Note**: The FileZen module automatically sets `keepUploads: false` by default for optimal server-side usage.

### 2. Inject ZenStorage

```typescript
import { Injectable } from '@nestjs/common';
import { ZenStorage } from '@filezen/js';
import { InjectZenStorage } from '@filezen/nest';

@Injectable()
export class FileService {
  constructor(
    @InjectZenStorage()
    private readonly zenStorage: ZenStorage
  ) {}

  async uploadFile(file: File) {
    const upload = await this.zenStorage.upload(file, {
      folder: 'uploads',
      projectId: 'your-project-id',
    });
    
    return upload;
  }

  async uploadMultipleFiles(files: File[]) {
    const uploads = await this.zenStorage.bulkUpload(
      ...files.map(file => ({
        source: file,
        options: { folder: 'uploads' }
      }))
    );
    
    return uploads;
  }
}
```

## URL Presigning Controller

The FileZen module includes a built-in controller for generating signed URLs for direct file uploads. This is useful for client-side uploads where you want to bypass your server.

### Basic Usage

By default, the controller is enabled and available at `POST /upload/sign`:

```typescript
// POST /upload/sign
{
  "path": "/files/upload",
  "fileKey": "my-file.jpg",
  "expiresIn": 3600 // optional, defaults to 1 hour
}

// Response
{
  "url": "https://api.filezen.dev/files/upload?signature=...&accessKey=...&expires=..."
}
```

### Controller Configuration

You can customize the controller behavior when setting up the module:

```typescript
FileZenModule.forRoot({
  apiKey: 'your-api-key',
  controller: {
    enabled: true, // Enable/disable the controller (default: true)
    path: 'custom/upload/sign', // Custom path (default: 'upload/sign')
  }
})
```

**Note**: The controller is enabled by default. Set `enabled: false` to disable it.

### Authentication

You can add authentication to the controller by providing a middleware function:

```typescript
import { Injectable } from '@nestjs/common';
import { FileZenModule } from '@filezen/nest';

@Injectable()
export class AuthService {
  async validateRequest(request: any): Promise<boolean> {
    // Your authentication logic here
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) return false;
    
    // Validate token, check user permissions, etc.
    return await this.validateToken(token);
  }
}

@Module({
  imports: [
    FileZenModule.forRoot({
      apiKey: 'your-api-key',
      controller: {
        enabled: true,
        path: 'upload/sign',
        middleware: (request) => {
          // You can inject services here if needed
          return this.authService.validateRequest(request);
        }
      }
    }),
  ],
})
export class AppModule {}
```

**Note**: The middleware function should return `false` to reject the request. If the middleware returns `false`, the controller will throw a `BadRequestException` with the message "Middleware not passed". Any other return value (including `true`, `undefined`, `null`, etc.) will allow the request to proceed.

### Custom Request Types

You can specify custom request types for better type safety:

```typescript
interface CustomRequest {
  user: { id: string; role: string };
  headers: { authorization?: string };
}

FileZenModule.forRoot({
  apiKey: 'your-api-key',
  controller: {
    middleware: (request: CustomRequest) => {
      return request.user.role === 'admin';
    }
  }
})
```

**Note**: The middleware function should return `false` to reject the request. If the middleware returns `false`, the controller will throw a `BadRequestException` with the message "Middleware not passed". Any other return value (including `true`, `undefined`, `null`, etc.) will allow the request to proceed.

### Custom Controller Path

You can change the controller path to match your API structure:

```typescript
FileZenModule.forRoot({
  apiKey: 'your-api-key',
  controller: {
    path: 'api/v1/files/presign', // Custom path
  }
})
```

### Disable Controller

If you don't need the presigning functionality, you can disable it:

```typescript
FileZenModule.forRoot({
  apiKey: 'your-api-key',
  controller: {
    enabled: false, // Disable the controller
  }
})
```

### Manual Controller Setup

If you need more control, you can create your own controller using the factory function:

```typescript
import { Module } from '@nestjs/common';
import { FileZenModule, createFileZenController } from '@filezen/nest';

@Module({
  imports: [
    FileZenModule.forRoot({
      apiKey: 'your-api-key',
      controller: { enabled: false }, // Disable default controller
    }),
  ],
  controllers: [
    // Create custom controller with your own logic
    createFileZenController({
      path: 'custom/presign',
    }),
  ],
})
export class AppModule {}
```

### Custom Controller with Additional Logic

```typescript
import { Module, Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FileZenModule, createFileZenController } from '@filezen/nest';
import { AuthGuard } from '@nestjs/passport';

// Create custom controller with additional decorators
const CustomFileZenController = createFileZenController({
  path: 'secure/upload/sign'
});

// Extend the controller with additional functionality
@Controller('secure/upload/sign')
export class SecureFileZenController extends CustomFileZenController {
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async generateSignedUrl(@Body() body: SignedUrlRequest) {
    // Add custom logic before generating signed URL
    console.log('Generating signed URL for:', body.fileKey);
    
    return super.generateSignedUrl(body);
  }
}

@Module({
  imports: [
    FileZenModule.forRoot({
      apiKey: process.env.FILEZEN_API_KEY,
      controller: { enabled: false }, // Disable default controller
    }),
  ],
  controllers: [SecureFileZenController],
})
export class AppModule {}
```

### Client-Side Usage

Once you have the signed URL, you can use it directly from the client:

```javascript
// Get signed URL from your Nest.js server
const response = await fetch('/upload/sign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    path: '/files/upload',
    fileKey: 'my-file.jpg',
    expiresIn: 3600
  })
});

const { url } = await response.json();

// Upload directly to FileZen using the signed URL
const formData = new FormData();
formData.append('file', file);

await fetch(url, {
  method: 'POST',
  body: formData
});
```

## Configuration Options

### Static Configuration

```typescript
FileZenModule.forRoot({
  apiKey: 'your-api-key',
  baseURL: 'https://api.filezen.com',
  keepUploads: false, // Default for Nest.js (server-side)
  global: true, // Make the module global
  controller: {
    enabled: true,
    path: 'upload/sign',
    middleware: (request) => Promise<boolean>,
  }
})
```

### Async Configuration

```typescript
FileZenModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    apiKey: configService.get('FILEZEN_API_KEY'),
    baseURL: configService.get('FILEZEN_BASE_URL'),
    keepUploads: false, // Default for Nest.js (server-side)
    controller: {
      enabled: true,
      path: 'upload/sign',
      middleware: (request) => configService.get('AUTH_ENABLED') ? validateRequest(request) : true,
    }
  }),
  inject: [ConfigService],
  global: true,
})
```

## Server-Side Optimizations

The Nest.js module automatically sets `keepUploads: false` by default, which is optimized for server-side usage:

- **Memory Efficiency**: Uploads are not stored in memory after completion
- **Stateless Operations**: Each upload is independent and doesn't maintain state
- **Better Performance**: Reduces memory footprint in long-running server processes

If you need to track uploads (e.g., for progress monitoring), you can explicitly enable it:

```typescript
FileZenModule.forRoot({
  apiKey: 'your-api-key',
  keepUploads: true, // Enable upload tracking
})
```

## API Reference

### InjectZenStorage Decorator

Use the `@InjectZenStorage()` decorator to inject the `ZenStorage` instance directly:

```typescript
import { Injectable } from '@nestjs/common';
import { ZenStorage } from '@filezen/js';
import { InjectZenStorage } from '@filezen/nest';

@Injectable()
export class MyService {
  constructor(
    @InjectZenStorage()
    private readonly zenStorage: ZenStorage
  ) {}
}
```

### ZenStorage Methods

The injected `ZenStorage` instance provides all the original methods:

#### `upload(source, options?)`
Upload a single file.

```typescript
const upload = await this.zenStorage.upload(file, {
  folder: 'uploads',
  projectId: 'project-id',
});
```

#### `bulkUpload(...uploads)`
Upload multiple files.

```typescript
const uploads = await this.zenStorage.bulkUpload(
  { source: file1, options: { folder: 'uploads' } },
  { source: file2, options: { folder: 'uploads' } }
);
```

#### `buildUpload(source, options?)`
Build an upload instance without starting it.

```typescript
const upload = this.zenStorage.buildUpload(file, {
  folder: 'uploads',
});
await upload.upload(); // Start the upload manually
```

#### `deleteByUrl(url)`
Delete a file by its URL.

```typescript
await this.zenStorage.deleteByUrl('https://filezen.com/file-url');
```

#### `generateSignedUrl(options)`
Generate a signed URL for direct uploads.

```typescript
const signedUrl = await this.zenStorage.generateSignedUrl({
  path: '/files/upload',
  fileKey: 'my-file.jpg',
  expiresIn: 3600
});
```

#### `addListener(listener)`
Add a listener for upload events.

```typescript
this.zenStorage.addListener({
  onUploadStart: (upload) => console.log('Upload started:', upload),
  onUploadProgress: (upload, progress) => console.log('Progress:', progress),
  onUploadComplete: (upload) => console.log('Upload completed:', upload),
  onUploadError: (upload, error) => console.error('Upload error:', error),
});
```

#### `removeListener(listener)`
Remove a previously added listener.

#### `getUploads`
Get all uploads (only available if `keepUploads: true`).

#### `activeUploads`
Get currently active uploads (only available if `keepUploads: true`).

## Types

### FileZenModuleOptions

```typescript
interface FileZenModuleOptions extends ZenStorageOptions {
  global?: boolean;
  controller?: FileZenControllerOptions;
}
```

### FileZenControllerOptions

```typescript
interface FileZenControllerOptions {
  path?: string; // Default: 'upload/sign'
  enabled?: boolean; // Default: true
  middleware?: (request: any) => Promise<boolean> | boolean;
}
```

**Note**: The middleware function should return `false` to reject the request. If the middleware returns `false`, the controller will throw a `BadRequestException` with the message "Middleware not passed". Any other return value (including `true`, `undefined`, `null`, etc.) will allow the request to proceed.

### SignedUrlRequest

```typescript
interface SignedUrlRequest {
  path: string;
  fileKey: string;
  expiresIn?: number; // seconds
}
```

### SignedUrlResponse

```typescript
interface SignedUrlResponse {
  url: string;
}
```

## Examples

### Complete Example with Authentication

```typescript
import { Module, Injectable } from '@nestjs/common';
import { FileZenModule } from '@filezen/nest';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateRequest(request: any): Promise<boolean> {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) return false;
      
      const payload = await this.jwtService.verifyAsync(token);
      return !!payload.userId;
    } catch {
      return false;
    }
  }
}

@Module({
  imports: [
    FileZenModule.forRoot({
      apiKey: process.env.FILEZEN_API_KEY,
      controller: {
        enabled: true,
        path: 'api/files/presign',
        middleware: (request) => {
          return this.authService.validateRequest(request);
        }
      }
    }),
  ],
  providers: [AuthService],
})
export class AppModule {}
```

### Custom Controller with Additional Logic

```typescript
import { Module, Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FileZenModule, createFileZenController } from '@filezen/nest';
import { AuthGuard } from '@nestjs/passport';

// Create custom controller with additional decorators
const CustomFileZenController = createFileZenController({
  path: 'secure/upload/sign'
});

// Extend the controller with additional functionality
@Controller('secure/upload/sign')
export class SecureFileZenController extends CustomFileZenController {
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async generateSignedUrl(@Body() body: SignedUrlRequest) {
    // Add custom logic before generating signed URL
    console.log('Generating signed URL for:', body.fileKey);
    
    return super.generateSignedUrl(body);
  }
}

@Module({
  imports: [
    FileZenModule.forRoot({
      apiKey: process.env.FILEZEN_API_KEY,
      controller: { enabled: false }, // Disable default controller
    }),
  ],
  controllers: [SecureFileZenController],
})
export class AppModule {}
```

## License

This package is part of the FileZen SDK and follows the same license terms. 