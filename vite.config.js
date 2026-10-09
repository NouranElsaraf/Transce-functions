import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the production build works from any folder
// (including opening it from a USB stick or a static host sub-path).
export default defineConfig({
  base: './',
  plugins: [react()],
  // `npm run studio` runs the local authoring API on 8787; the dev server proxies to it.
  server: { proxy: { '/api': 'http://127.0.0.1:8787' } },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{js,jsx}'],
    setupFiles: ['tests/setup.js'],
  },
});
