import react from '@astrojs/react';
import { defineConfig } from 'astro/config';
import * as path from 'node:path';

export default defineConfig({
  integrations: [react()],
  output: 'server', // Enable server-side rendering for API routes
  vite: {
    resolve: {
      alias: {
        '@filezen/js': path.resolve('../../sdks/filezen-js/src'),
        '@filezen/js/server': path.resolve('../../sdks/filezen-js/src/server'),
        '@filezen/astro': path.resolve('../../sdks/filezen-astro/src'),
      },
    },
    optimizeDeps: {
      include: ['@filezen/js', '@filezen/astro'],
    },
    define: {
      global: 'globalThis',
    },
  },
});
