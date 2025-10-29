import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'nicolasgrendene.com',
      '.nicolasgrendene.com' // Permite subdominios también
    ]
  }
})