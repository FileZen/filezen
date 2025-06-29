# FileZen BlockNote Editor

A rich text editor example that integrates [BlockNote](https://www.blocknotejs.org/docs/quickstart) with FileZen for seamless image uploading functionality.

## Features

- 📝 **Rich Text Editing**: Full-featured block-based editor powered by BlockNote
- 🖼️ **Image Upload**: Drag-and-drop image uploads with FileZen integration
- 🎨 **Dark Theme**: Modern dark theme UI optimized for BlockNote
- ⚡ **Next.js App Router**: Server-side upload handling with type safety
- 🔧 **TypeScript**: Full type safety throughout the application
- 🚀 **Real-time**: Instant image uploads with progress feedback

## About the Integration

This example demonstrates how to integrate FileZen's file upload capabilities with BlockNote's rich text editor. When users drag and drop images into the editor or use the image upload toolbar, FileZen handles the upload process and provides the image URL back to BlockNote for display.

### Key Integration Points

1. **Custom Upload Function**: FileZen provides the `uploadFile` function required by BlockNote's image upload feature
2. **API Route**: Next.js API route handles server-side file processing using FileZen
3. **Client Provider**: React context provides the FileZen client throughout the application

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn (this project uses Yarn workspaces)
- FileZen API key

### Installation

1. Install dependencies:
```bash
yarn install
```

2. Set up your environment variables:
```bash
# Create .env file in the root of your project
FILEZEN_API_KEY=your_api_key_here
```

3. Start the development server:
```bash
yarn dev
```

4. Open [http://localhost:3005](http://localhost:3005) to view the application.

## How It Works

### Image Upload Flow

1. **User Action**: User drags an image into the BlockNote editor or clicks the image upload button
2. **BlockNote Integration**: BlockNote calls the custom `uploadFile` function provided to the editor
3. **FileZen Upload**: The function uses the FileZen client to upload the file to your configured storage
4. **URL Return**: FileZen returns the public URL of the uploaded image
5. **Editor Update**: BlockNote receives the URL and displays the image in the document

### Code Structure

```
src/
├── app/
│   ├── api/
│   │   └── upload/
│   │       └── route.ts         # FileZen upload API endpoint
│   ├── globals.css              # Global styles with BlockNote dark theme
│   ├── layout.tsx               # Root layout with FileZen provider
│   └── page.tsx                 # Main page component
└── components/
    └── BlockNoteEditor.tsx      # BlockNote editor with FileZen integration
```

### Key Components

#### BlockNote Editor Integration

```typescript
const uploadFile = async (file: File): Promise<string> => {
  const result = await zenClient.upload(file);
  
  if (result.error) {
    throw new Error(result.error.message);
  }
  
  return result.file.url;
};

const editor = useCreateBlockNote({
  uploadFile, // FileZen integration
});
```

#### API Route

```typescript
import { ZenApi } from '@filezen/js';
import { createZenNextRouter } from '@filezen/next';

const zenApi = new ZenApi();

export const { POST, DELETE } = createZenNextRouter(zenApi);
```

## Customization

### Styling

The editor includes custom CSS for dark theme compatibility. You can customize the appearance by modifying the styles in `src/app/globals.css`:

```css
/* Custom BlockNote styling for dark theme */
.bn-editor {
  background: #1f2937 !important;
  color: #e5e7eb !important;
}
```

### Upload Configuration

You can customize the upload behavior by modifying the API route in `src/app/api/upload/route.ts`. Add authentication, file validation, or custom metadata:

```typescript
const requestMiddleware = async (request: NextRequest) => {
  // Add authentication, validation, etc.
  const user = await getUserFromRequest(request);
  return { userId: user.id };
};

export const { POST, DELETE } = createZenNextRouter(zenApi, {
  onRequest: requestMiddleware,
});
```

## BlockNote Features Supported

- ✅ **Image Upload**: Drag-and-drop and toolbar image uploads
- ✅ **Rich Text**: All standard BlockNote formatting options  
- ✅ **Block Types**: Headings, paragraphs, lists, code blocks, etc.
- ✅ **Keyboard Shortcuts**: Full keyboard navigation support
- ✅ **Collaborative Ready**: Can be extended with real-time collaboration

## API Endpoints

- `POST /api/upload` - Upload a file via FileZen
- `DELETE /api/upload` - Delete a file via FileZen

## Building for Production

```bash
yarn build
yarn start
```

## Related Documentation

- [BlockNote Documentation](https://www.blocknotejs.org/docs/quickstart) - Rich text editor setup and configuration
- [BlockNote Image Upload](https://www.blocknotejs.org/docs/ui-components/image-toolbar#image-upload) - Image upload implementation details
- [FileZen Documentation](https://filezen.dev) - File upload service documentation

## Key Technologies

- **Next.js 14**: React framework with App Router
- **BlockNote**: Block-based rich text editor
- **FileZen**: File upload and management service
- **React**: UI library with hooks and context
- **TypeScript**: Type-safe development
- **Mantine**: UI components for BlockNote

## Troubleshooting

### Common Issues

1. **Images not uploading**: Check that `FILEZEN_API_KEY` is set correctly
2. **Dark theme not applied**: Ensure BlockNote CSS imports are in the correct order
3. **TypeScript errors**: Make sure all dependencies are properly installed

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=filezen:*
```

## License

This example is part of the FileZen SDK examples and follows the same license terms. 
