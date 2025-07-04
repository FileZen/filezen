'use client';

import { ZenFile } from '@filezen/js';
import { useZenClient } from '@filezen/react';
import axios from 'axios';
import { useState } from 'react';

// Define the different phases of the AI image generation and upload workflow
type ProcessPhase = 'idle' | 'generating' | 'generated' | 'uploading' | 'uploaded';

/**
 * Unified state interface that manages the entire AI image generation and upload process
 * This replaces separate states for generation and upload to reduce complexity
 */
interface UnifiedState {
  phase: ProcessPhase;           // Current phase of the process workflow
  progress: number;              // Progress percentage (0-100) for current operation
  error: string | null;          // Error message if any operation fails
  generatedImage: {              // Generated image data from AI service
    url: string;                 // Direct URL to the generated image
    id: string;                  // Unique identifier for the generation
    prompt: string;              // Original prompt used for generation
  } | null;
  uploadedFile: ZenFile | null;  // FileZen file object after successful upload
}

export const AIImageGeneration = () => {
  const zenClient = useZenClient();
  const [prompt, setPrompt] = useState('Winter in Nebraska');
  
  // Single unified state managing the entire workflow
  const [state, setState] = useState<UnifiedState>({
    phase: 'idle',
    progress: 0,
    error: null,
    generatedImage: null,
    uploadedFile: null,
  });

  /**
   * Reset the entire component state back to initial values
   * Useful for starting a new generation cycle
   */
  const resetState = () => {
    setState({
      phase: 'idle',
      progress: 0,
      error: null,
      generatedImage: null,
      uploadedFile: null,
    });
  };

  /**
   * Generate an AI image using Pollinations.ai service
   * Process:
   * 1. Validate prompt input
   * 2. Set state to 'generating' phase
   * 3. Make request to Pollinations.ai with specified parameters
   * 4. On success: transition to 'generated' phase with image data
   * 5. On error: return to 'idle' phase with error message
   */
  const handleGenerate = async () => {
    // Input validation
    if (!prompt.trim()) {
      setState(prev => ({
        ...prev,
        error: 'Please enter a prompt',
      }));
      return;
    }

    // Initialize generation phase - clear previous data
    setState({
      phase: 'generating',
      progress: 0,
      error: null,
      generatedImage: null,
      uploadedFile: null,
    });

    try {
      // Create unique seed for consistent but unique image generation
      const seed = Date.now();
      
      // Build Pollinations.ai API URL with specific parameters:
      // - width/height: 1024x1024 for high quality square images
      // - model: flux (high-quality AI model)
      // - nologo: true (remove watermarks)
      // - private: true (don't include in public gallery)
      // - enhance: false (use prompt as-is)
      // - safe: false (allow broader content generation)
      // - seed: timestamp for reproducible but unique results
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURI(prompt)}?width=1024&height=1024&model=flux&nologo=true&private=true&enhance=false&safe=false&seed=${seed}`;
      
      // Fetch the generated image to validate it exists
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageUrl}`);
      }
      
      // Success: transition to 'generated' phase with image metadata
      setState(prev => ({
        ...prev,
        phase: 'generated',
        progress: 0,
        generatedImage: {
          id: seed.toString(),
          url: imageUrl,
          prompt: prompt,
        },
      }));
    } catch (error) {
      console.error('Generation error:', error);
      
      // Error handling: return to idle with descriptive error message
      setState(prev => ({
        ...prev,
        phase: 'idle',
        error: axios.isAxiosError(error)
          ? `API Error: ${error.response?.data?.message || error.message}`
          : error instanceof Error
            ? error.message
            : 'Generation failed',
      }));
    }
  };

  /**
   * Upload the generated image to FileZen cloud storage
   * Process:
   * 1. Validate that an image has been generated
   * 2. Set state to 'uploading' phase
   * 3. Create FileZen upload instance from image URL
   * 4. Set up progress tracking listener
   * 5. Execute upload and handle result
   * 6. On success: transition to 'uploaded' phase
   * 7. On error: return to 'generated' phase with error
   */
  const handleUploadToFileZen = async () => {
    // Ensure we have a generated image to upload
    if (!state.generatedImage) return;

    // Initialize upload phase
    setState(prev => ({
      ...prev,
      phase: 'uploading',
      progress: 0,
      error: null,
    }));

    try {
      // Create FileZen upload instance
      // buildUpload() can accept a URL and will download/upload the file
      const zenUpload = zenClient.buildUpload(
        state.generatedImage.url,  // Source: Pollinations.ai image URL
        {
          name: `ai-generated-${Date.now()}.png`,  // Unique filename with timestamp
          mimeType: 'image/png',                   // Specify file type for proper handling
        },
      );

      // Set up progress tracking for upload feedback
      // This listener will be called multiple times during upload
      zenUpload.addListener({
        onProgress: (upload, progress) => {
          setState(prev => ({
            ...prev,
            progress: progress.percent ?? 0,  // Update progress bar in real-time
          }));
        },
      });

      // Execute the upload to FileZen
      // This handles: downloading from source URL, uploading to FileZen, and returning file metadata
      const uploadResult = await zenUpload.upload();

      // Success: transition to 'uploaded' phase with FileZen file data
      setState(prev => ({
        ...prev,
        phase: 'uploaded',
        progress: 100,
        uploadedFile: uploadResult.file,  // Contains FileZen URL, ID, and metadata
      }));
    } catch (error) {
      // Error handling: return to 'generated' phase so user can retry upload
      setState(prev => ({
        ...prev,
        phase: 'generated',
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
      }));
    }
  };

  // Computed values for cleaner conditional rendering
  // These derive UI state from the unified state object
  const isGenerating = state.phase === 'generating';
  const isUploading = state.phase === 'uploading';
  const hasGeneratedImage = state.generatedImage !== null;
  const hasUploadedFile = state.uploadedFile !== null;

  return (
    <div className="rounded-lg bg-gray-800 p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        AI Image Generator
      </h2>

      {/* Prompt Input Section */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Enter your image prompt:
        </label>
        <div className="flex gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A beautiful sunset over mountains"
            className="flex-1 rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            disabled={isGenerating}
            onKeyPress={(e) =>
              e.key === 'Enter' &&
              !isGenerating &&
              handleGenerate()
            }
          />
          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-600"
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
          {/* Reset Button - Only show after generation or upload */}
          {(hasGeneratedImage || hasUploadedFile) && (
            <button
              onClick={resetState}
              disabled={isGenerating || isUploading}
              className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 disabled:cursor-not-allowed disabled:bg-gray-700"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Generation Progress Indicator */}
      {isGenerating && (
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-sm text-gray-300">
            <span>Generating image...</span>
            <span>{Math.round(state.progress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-700">
            <div
              className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${state.progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            This may take a few minutes depending on queue position...
          </p>
        </div>
      )}

      {/* Upload Progress Indicator */}
      {isUploading && (
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-sm text-gray-300">
            <span>Uploading to FileZen...</span>
            <span>{Math.round(state.progress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-700">
            <div
              className="h-2 rounded-full bg-green-600 transition-all duration-300"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Display - Shows any errors from generation or upload */}
      {state.error && (
        <div className="mb-6 rounded-md bg-red-900 p-4">
          <p className="text-sm text-red-300">{state.error}</p>
        </div>
      )}

      {/* Generated Image Display */}
      {hasGeneratedImage && (
        <div className="mb-6">
          <h3 className="mb-4 text-lg font-medium text-white">
            Generated Image
          </h3>
          <div className="rounded-lg border border-gray-600 p-4">
            {/* Display the generated image */}
            <img
              src={state.generatedImage!.url}
              alt={state.generatedImage!.prompt}
              className="mx-auto w-full max-w-md rounded-lg shadow-lg"
            />
            <p className="mt-2 text-center text-sm text-gray-400">
              Prompt: "{state.generatedImage!.prompt}"
            </p>

            {/* Upload to FileZen Button - Only show if not already uploaded */}
            {!hasUploadedFile && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleUploadToFileZen}
                  disabled={isUploading}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-gray-600"
                >
                  {isUploading ? 'Uploading...' : 'Upload to FileZen'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Success Display */}
      {hasUploadedFile && (
        <div className="mb-6 rounded-md bg-green-900 p-4">
          <p className="text-sm text-white">
            Successfully uploaded to FileZen! File ID: <br /> <br />
            {/* Direct link to the uploaded file in FileZen */}
            <a
              className={'underline'}
              rel="noopener noreferrer"
              target="_blank"
              href={state.uploadedFile!.url}
            >
              {state.uploadedFile!.url}
            </a>
          </p>
        </div>
      )}

      {/* API Attribution */}
      <div className="mt-6 rounded-md bg-gray-700 p-4">
        <p className="text-xs text-gray-400">
          Powered by{' '}
          <a
            href="https://pollinations.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300"
          >
            Pollinations.ai
          </a>{' '}
          - Free AI image generation service
        </p>
      </div>
    </div>
  );
};
