// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // root: 'src/renderer', // 设置渲染进程根目录
  // build: {
  //   outDir: '../../build', // 输出目录
  //   rollupOptions: {
  //     input: path.resolve(__dirname, 'public/index.html'), // 入口 HTML 文件
  //   },
  // },
  // resolve: {
  //   alias: {
  //     '@': path.resolve(__dirname, 'src/renderer'), // 设置别名
  //   },
  // },
  server: {
    open: true, // 启动时自动打开浏览器
    port: 3000, // 端口
    hmr: true, // 热模块替换
  },
  // publicDir: path.resolve(__dirname, 'public') // 确保 Vite 使用 public 目录
});
