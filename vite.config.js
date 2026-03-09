import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages repo adınızı buraya yazın (örn: '/2fa-viewer/')
// Kendi domain'iniz varsa '/' yapın
const base = '/2fa-viewer/'

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    historyApiFallback: true,
  },
})
