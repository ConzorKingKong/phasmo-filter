import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      'localhost',
      'd742-2605-59c8-6215-b510-00-9e3.ngrok-free.app'
    ]
  }
})
