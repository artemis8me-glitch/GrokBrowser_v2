import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  root: './', // Root is the project root, not a subfolder
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5176,
    strictPort: true,
    host: '0.0.0.0', // Expose to LAN
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ['**/node_modules/**', '**/dist/**']
    }
  }
})
