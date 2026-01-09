import React from 'react'
import ReactDOM from 'react-dom/client'
/**
 * 修复编译错误：
 * 在当前预览环境下，如果 ./ 路径无法解析，
 * 我们尝试直接引用或确保组件名与导出一致。
 */
import App from './App'
import './index.css'

// 确保容器存在后再进行挂载
const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  console.error("Failed to find the root element. Please ensure index.html has a <div id='root'></div>");
}
