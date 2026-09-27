import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    root: './',
  plugins: [
    react(), 
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
    build: {
    // Outputs the bundled production code neatly
    outDir: 'dist',
  }
});
