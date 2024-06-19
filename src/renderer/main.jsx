import React from 'react'
import { createRoot } from 'react-dom/client';
import App from './App.jsx'
import './index.css'

// 获取根元素
const container = document.getElementById('root');

// 创建一个 root
const root = createRoot(container);

// 使用 root.render 渲染 App
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);