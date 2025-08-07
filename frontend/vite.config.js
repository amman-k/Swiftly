import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    proxy: {
      // Any request starting with /api or /auth will be forwarded
      '/api': {
        target: 'http://localhost:5001', // Your backend server
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    }
  }
})