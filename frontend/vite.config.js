// frontend/vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure the base path is correct for Netlify deployment
  base: '/', 
  build: {
    outDir: 'frontend', // Standard output directory
  }
});