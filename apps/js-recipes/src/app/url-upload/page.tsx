import Link from 'next/link';

export default function UrlUploadPage() {
  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-3xl font-bold text-white">
          URL Upload Example
        </h1>
        <p className="mb-8 text-lg text-gray-300">
          This feature is coming soon! It will demonstrate how to upload files directly from URLs 
          using FileZen's JavaScript SDK.
        </p>
        
        <div className="rounded-lg bg-gray-800 p-8 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-semibold text-white mb-4">Coming Soon</h2>
          <p className="text-gray-400 mb-6">
            This feature is currently under development. It will include:
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <div className="rounded bg-gray-700 p-4">
              <h3 className="font-semibold text-white mb-2">URL Validation</h3>
              <p className="text-sm text-gray-300">
                Automatic validation of URLs before processing
              </p>
            </div>
            <div className="rounded bg-gray-700 p-4">
              <h3 className="font-semibold text-white mb-2">File Detection</h3>
              <p className="text-sm text-gray-300">
                Smart detection of file types and metadata from URLs
              </p>
            </div>
            <div className="rounded bg-gray-700 p-4">
              <h3 className="font-semibold text-white mb-2">MIME Type Extraction</h3>
              <p className="text-sm text-gray-300">
                Automatic MIME type detection from file extensions
              </p>
            </div>
            <div className="rounded bg-gray-700 p-4">
              <h3 className="font-semibold text-white mb-2">Remote Fetching</h3>
              <p className="text-sm text-gray-300">
                Efficient streaming of remote files to FileZen
              </p>
            </div>
          </div>
          
          <Link
            href="/"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
} 