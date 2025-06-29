import { createSdkConfig } from './base.js'

/**
 * Configuration for fullstack SDK packages (browser + server)
 * @param {Partial<import('tsup').Options>} options - Override options
 * @returns {import('tsup').Options}
 */
export function fullStackSdkConfig(options = {}) {
  return createSdkConfig({
    platform: 'neutral',
    target: 'es2020',
    // Don't bundle common dependencies - let the consumer decide
    external: [
      // HTTP clients
      'axios',
      'fetch',
      // Crypto libraries  
      'crypto',
      'uuid',
      '@aws-crypto/sha256-js',
      // Framework packages
      'react',
      'react-dom',
      'vue',
      'svelte',
      'astro',
      // Server frameworks
      'express',
      'fastify',
      'h3',
      '@nestjs/common'
    ],
    ...options
  })
} 