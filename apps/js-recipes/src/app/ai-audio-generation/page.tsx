import { AIAudioGeneration } from '@/components/AIAudioGeneration';

export default function AiAudioGenerationPage() {
  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-3xl font-bold text-white">
          AI Audio Generation Recipe
        </h1>
        <p className="mb-8 text-lg text-gray-300">
          This recipe demonstrates how to generate AI audio from text and upload it to FileZen. 
          Combine the power of AI text-to-speech with FileZen's file management capabilities.
        </p>
        
        <div className="mt-8 mb-8">
          <AIAudioGeneration />
        </div>
        
        <div className="rounded-lg bg-gray-800 p-6 mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Features:</h2>
          <ul className="mb-6 space-y-2 text-gray-300">
            <li className="flex items-center">
              <span className="mr-2 text-green-400">✓</span>
              AI-powered text-to-speech using Pollinations.ai
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-green-400">✓</span>
              Multiple voice options (Alloy, Echo, Fable, Onyx, Nova, Shimmer)
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-green-400">✓</span>
              Real-time audio generation and playback
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-green-400">✓</span>
              Upload generated audio to FileZen with one click
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-green-400">✓</span>
              Character count and input validation
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-green-400">✓</span>
              Audio metadata display and management
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
              <span>Enter your text to convert to speech (up to 1000 characters)</span>
            </li>
            <li className="flex">
              <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
                2
              </span>
              <span>Select your preferred voice from available options</span>
            </li>
            <li className="flex">
              <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
                3
              </span>
              <span>Pollinations.ai generates high-quality audio from your text</span>
            </li>
            <li className="flex">
              <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
                4
              </span>
              <span>Listen to the generated audio using the built-in player</span>
            </li>
            <li className="flex">
              <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
                5
              </span>
              <span>Upload the audio file to FileZen for storage and sharing</span>
            </li>
            <li className="flex">
              <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
                6
              </span>
              <span>Access your generated audio files through FileZen's interface</span>
            </li>
          </ol>
        </div>

        <div className="rounded-lg bg-gray-800 p-6 mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Voice Options:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div className="space-y-2">
              <div><strong>Alloy:</strong> Neutral, balanced voice</div>
              <div><strong>Echo:</strong> Clear male voice</div>
              <div><strong>Fable:</strong> British male accent</div>
            </div>
            <div className="space-y-2">
              <div><strong>Onyx:</strong> Deep male voice</div>
              <div><strong>Nova:</strong> Clear female voice</div>
              <div><strong>Shimmer:</strong> Bright female voice</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 