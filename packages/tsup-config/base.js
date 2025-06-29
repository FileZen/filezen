/** @type {import('tsup').Options} */
export const baseConfig = {
  format: ['cjs', 'esm'],
  dts: true, 
  clean: true,
  minify: false,
  sourcemap: true,
  outDir: 'dist',
  splitting: false,
  treeshake: true,
  tsconfig: 'tsconfig.build.json'
}

/**
 * Create tsup config for SDK packages
 * @param {Partial<import('tsup').Options>} options - Override options
 * @returns {import('tsup').Options}
 */
export function createSdkConfig(options = {}) {
  return {
    ...baseConfig,
    ...options,
    // Merge arrays properly
    entry: options.entry || ['src/index.ts'],
    external: options.external || []
  }
} 