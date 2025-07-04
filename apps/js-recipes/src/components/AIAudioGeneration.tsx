'use client';

import { ZenFile } from '@filezen/js';
import { useZenClient } from '@filezen/react';
import axios from 'axios';
import { useState } from 'react';

// Define the different phases of the AI audio generation and upload workflow
type ProcessPhase =
  | 'idle'
  | 'generating'
  | 'generated'
  | 'uploading'
  | 'uploaded';

/**
 * Unified state interface that manages the entire AI audio generation and upload process
 * This replaces separate states for generation and upload to reduce complexity
 */
interface UnifiedState {
  phase: ProcessPhase; // Current phase of the process workflow
  progress: number; // Progress percentage (0-100) for current operation
  error: string | null; // Error message if any operation fails
  generatedAudio: {
    // Generated audio data from AI service
    id: string; // Unique identifier for the generation
    text: string; // Original text used for generation
    voice?: string; // Voice model used for generation
    dataBase64?: string;
  } | null;
  uploadedFile: ZenFile | null; // FileZen file object after successful upload
}

export const AIAudioGeneration = () => {
  const zenClient = useZenClient();
  const [text, setText] = useState(
    'Hello, this is a test of AI audio generation.',
  );
  const [voice, setVoice] = useState('alloy'); // Default voice

  // Available voices for text-to-speech
  const availableVoices = [
    { id: 'alloy', name: 'Alloy (Neutral)' },
    { id: 'echo', name: 'Echo (Male)' },
    { id: 'fable', name: 'Fable (British Male)' },
    { id: 'onyx', name: 'Onyx (Male)' },
    { id: 'nova', name: 'Nova (Female)' },
    { id: 'shimmer', name: 'Shimmer (Female)' },
  ];

  // Single unified state managing the entire workflow
  const [state, setState] = useState<UnifiedState>({
    phase: 'idle',
    progress: 0,
    error: null,
    generatedAudio: null,
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
      generatedAudio: null,
      uploadedFile: null,
    });
  };

  /**
   * Generate AI audio using Pollinations.ai text-to-speech service
   * Process:
   * 1. Validate text input
   * 2. Set state to 'generating' phase
   * 3. Make request to Pollinations.ai with specified parameters
   * 4. On success: transition to 'generated' phase with audio data
   * 5. On error: return to 'idle' phase with error message
   */
  const handleGenerate = async () => {
    // Input validation
    if (!text.trim()) {
      setState((prev) => ({
        ...prev,
        error: 'Please enter some text to convert to speech',
      }));
      return;
    }

    // Initialize generation phase - clear previous data
    setState({
      phase: 'generating',
      progress: 0,
      error: null,
      generatedAudio: null,
      uploadedFile: null,
    });

    try {
      // Create unique seed for consistent but unique audio generation
      const seed = Date.now();

      // Build Pollinations.ai Audio API URL with specific parameters:
      // Using their text-to-speech endpoint with voice selection
      // The API format follows their pattern: https://text.pollinations.ai/...
      const postData = {
        model: 'openai-audio',
        modalities: ['text', 'audio'],
        audio: { voice: voice, format: 'wav' },
        messages: [
          {
            role: 'developer',
            content: 'You are a versatile AI',
          },
          {
            role: 'user',
            content:
              'Convert this longer text into speech using the selected voice.',
          },
          {
            role: 'user',
            content: text,
          },
        ],
      };
      const audioResponse = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        body: JSON.stringify(postData),
        headers: {
          'content-type': 'application/json',
        },
      });
      if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio: ${audioResponse.statusText}`);
      }

      // Check if response have audio
      const audioResponseJson = await audioResponse.json();
      const audioDataBase64 =
        audioResponseJson['choices']?.[0]?.['message']?.['audio']?.['data'];
      if (!audioDataBase64) {
        throw new Error('Invalid response: Expected audio file');
      }

      // Success: transition to 'generated' phase with audio metadata
      setState((prev) => ({
        ...prev,
        phase: 'generated',
        progress: 0,
        generatedAudio: {
          id: seed.toString(),
          text: text,
          voice: voice,
          dataBase64: 'data:audio/wav;base64,' + audioDataBase64,
        },
      }));
    } catch (error) {
      console.error('Audio generation error:', error);

      // Error handling: return to idle with descriptive error message
      setState((prev) => ({
        ...prev,
        phase: 'idle',
        error: axios.isAxiosError(error)
          ? `API Error: ${error.response?.data?.message || error.message}`
          : error instanceof Error
            ? error.message
            : 'Audio generation failed',
      }));
    }
  };

  /**
   * Upload the generated audio to FileZen cloud storage
   * Process:
   * 1. Validate that audio has been generated
   * 2. Set state to 'uploading' phase
   * 3. Create FileZen upload instance from audio URL
   * 4. Set up progress tracking listener
   * 5. Execute upload and handle result
   * 6. On success: transition to 'uploaded' phase
   * 7. On error: return to 'generated' phase with error
   */
  const handleUploadToFileZen = async () => {
    // Ensure we have a generated audio to upload
    if (!state.generatedAudio) return;

    // Initialize upload phase
    setState((prev) => ({
      ...prev,
      phase: 'uploading',
      progress: 0,
      error: null,
    }));

    try {
      // Execute the upload to FileZen
      // upload() can accept a URL and will download/upload the file
      const uploadResult = await zenClient.upload(
        state.generatedAudio.dataBase64!, // Source: Pollinations.ai audio base64 data
        {
          // Unique filename with timestamp
          name: `ai-audio-${Date.now()}.wav`,
          // Specify file type for proper handling
          mimeType: 'audio/wav',
          // Specify file metadata
          metadata: {
            text: text,
            voice: voice,
          },
          // Set up progress tracking for upload feedback
          listener: {
            onProgress: (upload, progress) => {
              setState((prev) => ({
                ...prev,
                progress: progress.percent ?? 0, // Update progress bar in real-time
              }));
            },
          },
        },
      );

      // Success: transition to 'uploaded' phase with FileZen file data
      setState((prev) => ({
        ...prev,
        phase: 'uploaded',
        progress: 100,
        uploadedFile: uploadResult.file, // Contains FileZen URL, ID, and metadata
      }));
    } catch (error) {
      // Error handling: return to 'generated' phase so user can retry upload
      setState((prev) => ({
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
  const hasGeneratedAudio = state.generatedAudio !== null;
  const hasUploadedFile = state.uploadedFile !== null;

  return (
    <div className="rounded-lg bg-gray-800 p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        AI Audio Generator
      </h2>

      {/* Text Input Section */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Enter text to convert to speech:
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., Welcome to our AI-powered text-to-speech service..."
            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            rows={4}
            disabled={isGenerating}
            maxLength={1000} // Reasonable limit for TTS
          />
          <div className="mt-1 text-right text-xs text-gray-400">
            {text.length}/1000 characters
          </div>
        </div>

        {/* Voice Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Select voice:
          </label>
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            disabled={isGenerating}
            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            {availableVoices.map((voiceOption) => (
              <option key={voiceOption.id} value={voiceOption.id}>
                {voiceOption.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !text.trim()}
            className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-600"
          >
            {isGenerating ? 'Generating Audio...' : 'Generate Audio'}
          </button>
          {/* Reset Button - Only show after generation or upload */}
          {(hasGeneratedAudio || hasUploadedFile) && (
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
            <span>Generating audio...</span>
            <span>{Math.round(state.progress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-700">
            <div
              className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${state.progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Converting your text to speech...
          </p>
        </div>
      )}

      {/* Error Display - Shows any errors from generation or upload */}
      {state.error && (
        <div className="mb-6 rounded-md bg-red-900 p-4">
          <p className="text-sm text-red-300">{state.error}</p>
        </div>
      )}

      {/* Generated Audio Display */}
      {hasGeneratedAudio && (
        <div className="mb-6">
          <h3 className="mb-4 text-lg font-medium text-white">
            Generated Audio
          </h3>
          <div className="rounded-lg border border-gray-600 p-4">
            {/* Audio Player */}
            <div className="mb-4">
              <audio
                controls
                className="w-full"
                src={state.generatedAudio!.dataBase64}
                preload="metadata"
              >
                Your browser does not support the audio element.
              </audio>
            </div>

            {/* Audio Metadata */}
            <div className="space-y-2 text-sm text-gray-400">
              <p>
                <strong>Text:</strong> "{state.generatedAudio!.text}"
              </p>
              <p>
                <strong>Voice:</strong>{' '}
                {availableVoices.find(
                  (v) => v.id === state.generatedAudio!.voice,
                )?.name || state.generatedAudio!.voice}
              </p>
              <p>
                <strong>Length:</strong> {state.generatedAudio!.text.length}{' '}
                characters
              </p>
            </div>

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

      {/* Upload Success Display */}
      {hasUploadedFile && (
        <div className="mb-6 rounded-md bg-green-900 p-4">
          <p className="text-sm text-white">
            Successfully uploaded to FileZen! <br /> <br />
            {/* Direct link to the uploaded file in FileZen */}
            <a
              className={'underline'}
              rel="noopener noreferrer"
              target="_blank"
              href={state.uploadedFile!.url}
            >
              {state.uploadedFile!.url}
            </a>
            {state.uploadedFile!.metadata && (
              <a>
                <br />
                <br />
                File metadata: <br />
                {JSON.stringify(state.uploadedFile!.metadata, null, ' ')}
              </a>
            )}
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
          - Free AI text-to-speech generation service
        </p>
      </div>
    </div>
  );
};
