import { createSdkConfig } from './base.js'

/**
 * Configuration for server-only SDK packages
 * @param {Partial<import('tsup').Options>} options - Override options
 * @returns {import('tsup').Options}
 */
export function serverSdkConfig(options = {}) {
  return createSdkConfig({
    platform: 'node',
    target: 'node16',
    // Common server externals - don't bundle Node.js built-ins
    external: [
      'fs',
      'path',
      'crypto',
      'http',
      'https',
      'url',
      'querystring',
      'stream',
      'util',
      'os',
      'buffer'
    ],
    ...options
  }) 
} 