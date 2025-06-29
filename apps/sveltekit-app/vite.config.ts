import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      external: ['crypto', 'fs', 'path'],
    },
  },
  ssr: {
    noExternal: ['@filezen/js', '@filezen/svelte'],
  },
});
