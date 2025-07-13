import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/analyze': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path, // Keep /analyze as-is
      },
    },
  },
});