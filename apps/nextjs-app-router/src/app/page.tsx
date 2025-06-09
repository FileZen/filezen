import { FileUpload } from '@/components/FileUpload';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-3xl font-bold text-white">
          FileZen Upload Example
        </h1>
        <p className="mb-8 text-lg text-gray-300">
          This example demonstrates how to use FileZen for file uploads with Next.js App Router. 
          The upload is handled with API routes and server-side processing.
        </p>
        <FileUpload />
      </div>
    </main>
  );
}
