# React with Provider Example

This example app demonstrates how to use the `@filezen/react` SDK in a Next.js application with the FileZenProvider.

## Features Demonstrated

- **FileZenProvider**: Context provider for SDK configuration
- **File Picker**: Built-in file selection with different options
- **Drag & Drop**: Drop zone for file uploads
- **Bulk Upload**: Multiple file upload with progress tracking
- **Upload Status**: Real-time upload monitoring and cancellation

## Getting Started

1. **Install Dependencies**
   ```bash
   yarn install
   ```

2. **Environment Variables**
   Create a `.env.local` file with your FileZen configuration:
   ```
   NEXT_PUBLIC_FILEZEN_API_KEY=your_api_key_here
   ```

3. **Run the Development Server**
   ```bash
   yarn dev
   ```

4. **Open in Browser**
   Navigate to [http://localhost:3001](http://localhost:3001)

## Usage Examples

### Basic Setup

Wrap your app with the FileZenProvider:

```tsx
import { FileZenProvider } from '@filezen/react';

function App() {
  return (
    <FileZenProvider
      apiKey={process.env.NEXT_PUBLIC_FILEZEN_API_KEY}
    >
      {/* Your app content */}
    </FileZenProvider>
  );
}
```

### Using the Hook

#### File Picker Example

```tsx
import { useFileZen } from '@filezen/react';

function UploadComponent() {
  const { openPicker, uploads, cancel } = useFileZen();

  const handleUpload = () => {
    openPicker({ multiple: true, accept: 'image/*' });
  };

  return (
    <div>
      <button onClick={handleUpload}>Upload Images</button>
      {uploads.map(upload => (
        <div key={upload.localId}>
          {upload.name} - {upload.isCompleted ? 'Done' : 'Uploading...'}
          <button onClick={() => cancel(upload)}>Cancel</button>
        </div>
      ))}
    </div>
  );
}
```

#### Direct Upload Example

```tsx
import { useFileZen } from '@filezen/react';

function DirectUploadComponent() {
  const { upload } = useFileZen();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const uploadResult = await upload(file);
        console.log('Upload completed:', uploadResult);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileSelect} />
    </div>
  );
}
```

#### Bulk Upload Example

```tsx
import { useFileZen } from '@filezen/react';

function BulkUploadComponent() {
  const { bulkUpload } = useFileZen();

  const handleMultipleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      try {
        const uploads = Array.from(files).map(file => ({
          source: file,
          options: {}
        }));
        
        const results = await bulkUpload(...uploads);
        console.log('All uploads completed:', results);
      } catch (error) {
        console.error('Bulk upload failed:', error);
      }
    }
  };

  return (
    <div>
      <input type="file" multiple onChange={handleMultipleFiles} />
    </div>
  );
}
```

### Drag & Drop

```tsx
import { FileZenDropContainer } from '@filezen/react/drop-container/FileZenDropContainer';

function DropZone() {
  return (
    <FileZenDropContainer>
      <div className="drop-zone">
        Drag files here to upload
      </div>
    </FileZenDropContainer>
  );
}
```

## Available Components

- `FileZenProvider` - Context provider for SDK configuration
- `FileZenDropContainer` - Drop zone component for drag & drop uploads
- `useFileZen` - Hook to access FileZen functionality

## API Reference

### FileZenProvider Props

- `apiKey?: string` - Your FileZen API key

### useFileZen Hook

Returns an object with:

- `openPicker(options?)` - Open file picker dialog
- `upload(source, options?)` - Upload a single file
- `bulkUpload(...uploads)` - Upload multiple files
- `uploads` - Array of active uploads
- `cancel(upload)` - Cancel an upload


## File Picker Options

```tsx
openPicker({
  multiple: true,           // Allow multiple files
  accept: 'image/*',        // File type restrictions
});
``` 