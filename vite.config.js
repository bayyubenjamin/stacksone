import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      // Memaksa library yang mencari 'stream' untuk menggunakan versi browser
      stream: 'stream-browserify',
      // Memaksa buffer agar konsisten
      buffer: 'buffer',
    },
  },
  plugins: [
    react(),
    nodePolyfills({
      // Sertakan semua polyfill node
      include: ['buffer', 'stream', 'util', 'process'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
})
