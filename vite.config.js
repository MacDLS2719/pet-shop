import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno según el modo (development, production)
  const env = loadEnv(mode, process.cwd(), '');
  
  // Si existe VITE_API_URL la usa, de lo contrario usa el localhost por defecto
  const targetUrl = env.VITE_API_URL || 'http://localhost:8000';

  return {
    plugins: [react()],
    server: {
      allowedHosts: [
        'pet-shop-production-8f5c.up.railway.app',
        '.up.railway.app'
      ],
      proxy: {
        '/api': {
          target: targetUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      allowedHosts: [
        'pet-shop-production-8f5c.up.railway.app',
        '.up.railway.app'
      ]
    }
  }
})