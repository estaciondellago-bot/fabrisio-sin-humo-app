import os from 'node:os';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // El proyecto vive dentro de Dropbox, que bloquea archivos al sincronizar y
  // rompe la optimización de deps de Vite (EBUSY al renombrar .vite/deps).
  // Mover la caché al temp del SO la saca del alcance de Dropbox.
  cacheDir: path.join(os.tmpdir(), 'vite-fabrisio-sin-humo'),
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
