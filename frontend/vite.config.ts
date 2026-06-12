import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    host: true,
    allowedHosts: ['9238d5781f64.ngrok-free.app'],
    port: 5173,
    cors:true
  }
})
