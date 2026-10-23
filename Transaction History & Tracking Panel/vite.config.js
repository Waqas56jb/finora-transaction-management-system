import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { finoraStorePlugin } from './vite-plugin-finora-store.js';
import { appIdentity } from './src/config/app.js';

export default defineConfig({
  plugins: [react(), finoraStorePlugin()],
  server: { port: appIdentity.port, strictPort: true },
  preview: { port: appIdentity.port, strictPort: true },
});
