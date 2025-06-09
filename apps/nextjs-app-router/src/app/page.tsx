import { FileUpload } from '@/components/FileUpload';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-white">
          File Upload Example
        </h1>
        <FileUpload />
      </div>
    </main>
  );
}
