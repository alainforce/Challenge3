import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({ plugins: [react()], build: { rollupOptions: { input: {
  sidepanel: 'src/sidepanel/index.html', options: 'src/options/index.html', background: 'src/background/service-worker.ts', content: 'src/content/content-script.ts'
}, output: { entryFileNames: '[name].js', chunkFileNames: 'chunks/[name]-[hash].js', assetFileNames: 'assets/[name]-[hash][extname]' } } } });
