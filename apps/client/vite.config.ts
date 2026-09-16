import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2022',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mobx': ['mobx', 'mobx-react-lite'],
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
  },
  esbuild: {
    legalComments: 'none',
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
