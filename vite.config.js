import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // 允许局域网访问
    port: 5173, // 指定端口
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        ws: true,
        secure: false
      },
      '/ws': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ws/, ''),
        ws: true,
        secure: false
      },
      '/ws/info': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path,
        ws: true,
        secure: false,
        headers: {
          'Origin': 'http://localhost:5173',
          'X-Forwarded-For': 'localhost:5173'
        },
        logLevel: 'debug'
      }
    }
  }
})