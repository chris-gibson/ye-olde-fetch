import { defineConfig } from 'vite';

export default defineConfig({
  base: '/ye-olde-fetch/',
  server: {
    port: 5173,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
  },
});
