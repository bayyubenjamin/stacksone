import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills' // Opsional, tapi manual define lebih ringan

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  define: {
    // PENTING: Stacks.js membutuhkan 'global' yang mengarah ke window
    'global': 'window',
    'process.env': {},
  },
})
