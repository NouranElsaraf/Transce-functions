import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the production build works from any folder
// (including opening it from a USB stick or a static host sub-path).
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{js,jsx}'],
    setupFiles: ['tests/setup.js'],
  },
});
