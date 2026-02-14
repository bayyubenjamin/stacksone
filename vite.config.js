import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      buffer: 'buffer', // Mengarahkan import 'buffer' ke modul yang benar
    },
  },
  define: {
    'global': 'globalThis', // Gunakan globalThis untuk kompatibilitas terbaik
  },
})
