# FileZen Expo Demo 🚀

A complete **React Native/Expo** demo showcasing [FileZen](https://filezen.dev) file upload capabilities with image previews, progress tracking, and error handling.

## 🌟 Features

- ✅ **File Selection**: Images and documents via native pickers
- ✅ **Real-time Upload Progress**: Visual progress indicators  
- ✅ **Image Previews**: Automatic thumbnails with on-the-fly resizing
- ✅ **Error Handling**: Comprehensive upload error management
- ✅ **TypeScript Support**: Fully typed FileZen integration
- ✅ **Cross-platform**: Works on iOS, Android, and Web

## 📱 How to Add FileZen to Your App

### 1. Install Dependencies

```bash
yarn add @filezen/js @filezen/react expo-document-picker expo-image-picker
```

### 2. Set Up FileZen Provider

Choose between two providers based on your needs:

#### Option A: ZenStorageProvider (Direct Upload)
For direct uploads to FileZen without a server:

```tsx
// App.tsx or your root component
import { ZenStorageProvider } from '@filezen/react';

export default function App() {
  return (
    <ZenStorageProvider
      apiKey="your-filezen-api-key" // Optional: can use FILEZEN_API_KEY env variable
    >
      {/* Your app components */}
    </ZenStorageProvider>
  );
}
```

#### Option B: ZenClientProvider (Server Integration)
For server-side presigned URL generation:

```tsx
// App.tsx or your root component
import { ZenClientProvider } from '@filezen/react';

export default function App() {
  return (
    <ZenClientProvider
      serverUrl="https://your-server.com/api/filezen" // Your server endpoint
    >
      {/* Your app components */}
    </ZenClientProvider>
  );
}
```

### 3. Use FileZen in Components

#### With ZenStorageProvider (Direct Upload)

```tsx
import { useFileZen } from '@filezen/react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export default function FileUpload() {
  const { upload, uploads } = useFileZen();

  const pickAndUploadImage = async () => {
    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      // Upload with FileZen
      await upload(asset.uri, {
        name: asset.fileName || `image_${Date.now()}.jpg`,
        folder: 'mobile-uploads',
        projectId: 'your-project-id',
        listener: {
          onProgress: (upload, progress) => {
            console.log(`Progress: ${progress.percent}%`);
          },
          onComplete: (upload) => {
            console.log('Upload complete!', upload.file?.url);
          },
          onError: (upload, error) => {
            console.error('Upload failed:', error.message);
          },
        },
      });
    }
  };

  return (
    <TouchableOpacity onPress={pickAndUploadImage}>
      <Text>Upload Image</Text>
    </TouchableOpacity>
  );
}
```

#### With ZenClientProvider (Server Integration)

```tsx
import { useZenClient } from '@filezen/react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export default function FileUpload() {
  const { upload, uploads } = useZenClient();

  const pickAndUploadImage = async () => {
    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      // Upload with FileZen
      await upload(asset.uri, {
        name: asset.fileName || `image_${Date.now()}.jpg`,
        folder: 'mobile-uploads',
        projectId: 'your-project-id',
        listener: {
          onProgress: (upload, progress) => {
            console.log(`Progress: ${progress.percent}%`);
          },
          onComplete: (upload) => {
            console.log('Upload complete!', upload.file?.url);
          },
          onError: (upload, error) => {
            console.error('Upload failed:', error.message);
          },
        },
      });
    }
  };

  return (
    <TouchableOpacity onPress={pickAndUploadImage}>
      <Text>Upload Image</Text>
    </TouchableOpacity>
  );
}
```

## 🔧 Configuration

### Provider Comparison

| Feature | ZenStorageProvider | ZenClientProvider |
|---------|-------------------|-------------------|
| **Upload Method** | Direct to FileZen | Direct to FileZen |
| **API Key** | Required (client-side) | Server-side only |
| **Server Required** | No | Yes (for generating signed URLs) |
| **Use Case** | Simple apps, prototypes | Production apps with custom logic |

### FileZen API Setup

#### For ZenStorageProvider (Direct Upload)
1. **Get API Key**: Sign up at [filezen.dev](https://filezen.dev)
2. **Configure Provider**:

```tsx
<ZenStorageProvider
  apiKey="fz_live_your_api_key_here" // Optional: uses FILEZEN_API_KEY env variable if not provided
  keepUploads={true} // Keep upload history
>
```

#### For ZenClientProvider (Server Integration)
1. **Set up server endpoint** that generates presigned URLs
2. **Configure Provider**:

```tsx
<ZenClientProvider
  serverUrl="https://your-server.com/api/filezen" // Your server endpoint
>
```

### Image Resizing (Built-in)

FileZen automatically resizes images on-the-fly using URL parameters:

```tsx
// Original image
<Image source={{ uri: upload.file?.url }} />

// Resized thumbnail (120x120, cover fit)
<Image source={{ 
  uri: `${upload.file?.url}?width=120&height=120&fit=cover` 
}} />
```

For all available resizing parameters, see the [Dynamic Image Documentation](https://docs.filezen.dev/dynamic-image).



## 🚀 Running the Demo

```bash
# Install dependencies
yarn install

# Start Expo development server
yarn start

# Run on device/simulator
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR code for physical device
```

## 📁 Project Structure

```
apps/expo-app/
├── app/
│   ├── (tabs)/
│   │   └── upload.tsx          # Main upload screen
│   └── _layout.tsx
├── components/
│   ├── Upload.tsx              # File picker & upload logic
│   ├── UploadedFilesList.tsx   # Upload results display
│   └── ui/
└── package.json
```

## 🔍 Key Components

### `Upload.tsx`
- File selection (images/documents)
- Upload progress tracking
- Error handling with alerts
- File metadata display

### `UploadedFilesList.tsx`
- Upload history with status indicators
- Image previews with resizing
- Error state management
- TypeScript integration

## 🛠️ Advanced Usage

### Custom Upload Options

```tsx
await upload(fileUri, {
  name: 'custom-filename.jpg',
  folder: 'user-uploads/avatars',
  projectId: 'mobile-app',
  folderId: 'avatar-folder-id',
  metadata: {
    userId: '12345',
    uploadSource: 'mobile-app'
  },
  listener: {
    onStart: (upload) => setUploading(true),
    onProgress: (upload, progress) => {
      setProgress(progress.percent || 0);
    },
    onComplete: (upload) => {
      setUploading(false);
      // Access uploaded file: upload.file?.url
    },
    onError: (upload, error) => {
      setUploading(false);
      Alert.alert('Upload Failed', error.message);
    },
  },
});
```

### Bulk Upload

```tsx
const { bulkUpload } = useFileZen(); // or useZenClient()

await bulkUpload(
  { source: file1Uri, options: { folder: 'batch1' } },
  { source: file2Uri, options: { folder: 'batch1' } },
  { source: file3Uri, options: { folder: 'batch1' } }
);
```

## 📋 Requirements

- **Expo SDK**: 51+
- **React Native**: 0.74+
- **TypeScript**: 5.0+ (recommended)
- **FileZen Account**: [Sign up here](https://filezen.dev)

## 🤝 Support

- 📖 **Documentation**: [docs.filezen.dev](https://docs.filezen.dev)
- 💬 **Support**: [support@filezen.dev](mailto:support@filezen.dev)
- 🐛 **Issues**: [GitHub Issues](https://github.com/filezen/filezen/issues)

---

**Ready to build?** Copy this demo structure and customize for your app! 🎉
