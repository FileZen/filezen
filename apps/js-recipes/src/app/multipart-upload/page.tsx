import { CustomMultipartUpload } from '@/components/CustomMultipartUpload';

export default function MultipartUploadPage() {
  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-3xl font-bold text-white">
          Custom Multipart Upload Example
        </h1>
        <p className="mb-8 text-lg text-gray-300">
          This example demonstrates a manual multipart upload implementation with FileZen and Next.js App Router. 
          You have full control over the chunking process, with custom upload handling via API routes and server-side processing.
        </p>
        <div className="rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Features:</h2>
          <ul className="mb-6 space-y-2 text-gray-300">
            <li className="flex items-center">
              <span className="mr-2 text-green-400">✓</span>
              Manual drag and drop file selection
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-green-400">✓</span>
              Custom URL-based uploads
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-green-400">✓</span>
              Manual progress tracking implementation
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-green-400">✓</span>
              Custom error handling
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-green-400">✓</span>
              File preview after successful upload
            </li>
          </ul>
        </div>
        <div className="mt-8">
          <CustomMultipartUpload />
        </div>
      </div>
    </main>
  );
} 