# FileZen Remix Example

This example demonstrates how to use FileZen for file uploads with Remix.

## Features

- File upload with drag & drop interface
- Image preview after upload
- Automatic cleanup of previous uploads
- Error handling and loading states
- Responsive design with Tailwind CSS

## Getting Started

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Start the development server:
   ```bash
   yarn dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How it works

This example uses:

- **@filezen/js** - Core FileZen JavaScript SDK
- **@filezen/react** - React hooks and providers
- **@filezen/remix** - Remix-specific router utilities
- **react-dropzone** - Drag & drop file upload interface
- **Tailwind CSS** - Styling

The upload is handled through a Remix resource route (`/api/upload`) that uses the FileZen SDK to process file uploads and deletions.

## File Structure

```
app/
├── components/
│   └── FileUpload.tsx          # Main upload component
├── routes/
│   ├── _index.tsx              # Home page
│   └── api.upload.tsx          # Upload API route
├── root.tsx                    # Root layout with providers
└── tailwind.css               # Tailwind styles
```

## Customization

You can customize the upload behavior by:

1. Modifying the `requestMiddleware` in `api.upload.tsx` to add authentication
2. Adjusting file type restrictions in `FileUpload.tsx`
3. Styling the upload interface in the component
4. Adding additional upload features like progress tracking 