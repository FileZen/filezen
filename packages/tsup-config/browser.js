import { createSdkConfig } from './base.js'

/**
 * Configuration for browser-only SDK packages
 * @param {Partial<import('tsup').Options>} options - Override options
 * @returns {import('tsup').Options}
 */
export function browserSdkConfig(options = {}) {
  return createSdkConfig({
    platform: 'browser',
    target: 'es2020',
    // Common browser externals
    external: [
      // Don't bundle these - assume they're provided by the environment
      'react',
      'react-dom',
      'vue',
      '@angular/core'
    ],
    ...options
  })
} 