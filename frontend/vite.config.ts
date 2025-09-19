import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    assetsDir: 'assets',
    outDir: 'dist',
    publicDir: 'public',
    copyPublicDir: true,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // 이미지 파일들은 루트에 유지
          if (assetInfo.name && /\.(jpg|jpeg|png|gif|svg)$/.test(assetInfo.name)) {
            return '[name][extname]'
          }
          return 'assets/[name].[hash][extname]'
        },
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 8080,
    allowedHosts: [
      'eumsamfrontend-production.up.railway.app',
      'localhost',
      '127.0.0.1',
      '.railway.app',
      '.up.railway.app',
      'all'
    ],
  },
})
