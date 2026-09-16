import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.stories.ts', 'src/test/**'],
    }),
  ],
  build: {
    target: 'es2022',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AtieshComponents',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: [],
    },
  },
  esbuild: {
    legalComments: 'none',
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
