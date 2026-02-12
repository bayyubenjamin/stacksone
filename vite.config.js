// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Tambahkan bagian ini untuk memperbaiki Stacks Connect
  define: {
    'global': 'window',
  },
})
