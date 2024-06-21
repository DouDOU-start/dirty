import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
  ],
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
    }
  },
  server: {
    open: false, // 启动时自动打开浏览器
    port: 3000, // 端口
    hmr: true // 热模块替换
  },
  publicDir: path.resolve(__dirname, 'public') // 确保 Vite 使用 public 目录
});