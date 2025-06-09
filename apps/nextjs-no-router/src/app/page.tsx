import { AvatarUpload } from '@/components/AvatarUpload';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-3xl font-bold text-white">FileZen Direct Upload Example</h1>
        <p className="mb-8 text-lg text-gray-300">
          This example demonstrates how to use FileZen for direct file uploads without API routes. 
          The upload is handled entirely on the client side using the FileZen SDK.
        </p>
        <AvatarUpload />
      </div>
    </main>
  );
}
