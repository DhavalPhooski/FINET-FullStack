import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Ensure consistent asset pathing on Vercel subdomains
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})