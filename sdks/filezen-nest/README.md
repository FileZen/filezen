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

## Configuration Options

### Static Configuration

```typescript
FileZenModule.forRoot({
  apiKey: 'your-api-key',
  baseURL: 'https://api.filezen.com',
  keepUploads: false, // Default for Nest.js (server-side)
  global: true, // Make the module global
})
```

### Async Configuration

```typescript
FileZenModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    apiKey: configService.get('FILEZEN_API_KEY'),
    baseURL: configService.get('FILEZEN_BASE_URL'),
    keepUploads: false, // Default for Nest.js (server-side)
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
}
```

### FileZenModuleAsyncOptions

```typescript
interface FileZenModuleAsyncOptions {
  global?: boolean;
  useFactory: (...args: any[]) => Promise<ZenStorageOptions> | ZenStorageOptions;
  inject?: any[];
}
```

## Examples

### File Upload Controller

```typescript
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ZenStorage } from '@filezen/js';
import { InjectZenStorage } from '@filezen/nest';

@Controller('files')
export class FilesController {
  constructor(
    @InjectZenStorage()
    private readonly zenStorage: ZenStorage
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const upload = await this.zenStorage.upload(file, {
      folder: 'uploads',
    });
    
    return {
      id: upload.id,
      url: upload.url,
      status: upload.status,
    };
  }
}
```

### With Configuration Service

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FileZenModule } from '@filezen/nest';

@Module({
  imports: [
    ConfigModule.forRoot(),
    FileZenModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get('FILEZEN_API_KEY'),
        baseURL: configService.get('FILEZEN_BASE_URL'),
        keepUploads: false, // Default for server-side
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Global Module Usage

```typescript
// In your main module
FileZenModule.forRoot({
  apiKey: 'your-api-key',
  global: true, // Makes ZenStorage available globally
})

// In any service across your app
@Injectable()
export class AnyService {
  constructor(
    @InjectZenStorage()
    private readonly zenStorage: ZenStorage
  ) {}
}
```

### Upload Progress Tracking (with keepUploads enabled)

```typescript
@Injectable()
export class FileService {
  constructor(
    @InjectZenStorage()
    private readonly zenStorage: ZenStorage
  ) {
    // Only works if keepUploads: true
    this.zenStorage.addListener({
      onUploadProgress: (upload, progress) => {
        console.log(`Upload ${upload.localId}: ${progress}%`);
      },
    });
  }

  getActiveUploads() {
    // Only works if keepUploads: true
    return this.zenStorage.activeUploads;
  }
}
```

## License

This package is part of the FileZen SDK and follows the same license terms. 