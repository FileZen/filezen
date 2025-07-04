import { AIImageGeneration } from '@/components/AIImageGeneration';

export default function AiImageGenerationPage() {
  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-3xl font-bold text-white">
          AI Image Generation Recipe
        </h1>
        <p className="mb-8 text-lg text-gray-300">
          This recipe demonstrates how to generate AI images and upload them to FileZen. 
          Combine the power of AI image generation with FileZen's file management capabilities.
        </p>
        
        <div className="mt-8 mb-8">
          <AIImageGeneration />
        </div>
        
        <div className="rounded-lg bg-gray-800 p-6 mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Features:</h2>
          <ul className="mb-6 space-y-2 text-gray-300">
            <li className="flex items-center">
              <span className="mr-2 text-green-400">✓</span>
              AI-powered image generation using Pollinations.ai
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-green-400">✓</span>
              Instant image generation with no waiting
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-green-400">✓</span>
              Manual upload to FileZen with one click
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-green-400">✓</span>
              Custom prompt input and generation parameters
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-green-400">✓</span>
              Generated image preview and management
            </li>
          </ul>
        </div>

        <div className="rounded-lg bg-gray-800 p-6 mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">How it works:</h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex">
              <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
                1
              </span>
              <span>Enter your image generation prompt</span>
            </li>
            <li className="flex">
              <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
                2
              </span>
              <span>Pollinations.ai instantly generates the image</span>
            </li>
            <li className="flex">
              <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
                3
              </span>
              <span>Image is generated and displayed instantly</span>
            </li>
            <li className="flex">
              <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
                4
              </span>
              <span>Click to upload the generated image to FileZen</span>
            </li>
            <li className="flex">
              <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
                5
              </span>
              <span>Access and manage your AI-generated images through FileZen</span>
            </li>
          </ol>
        </div>


      </div>
    </main>
  );
} 