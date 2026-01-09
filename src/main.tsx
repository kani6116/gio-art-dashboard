import React from 'react'
import ReactDOM from 'react-dom/client'

/**
 * 修复编译路径解析错误：
 * 1. 在部分预览环境中，相对路径需要更明确的指向。
 * 2. 确保导入的组件名与文件名严格匹配。
 */
import App from './App'
import './index.css'

// 获取 HTML 中的挂载根节点
const container = document.getElementById('root');

/**
 * 针对构建环境的鲁棒性检查：
 * 确保在执行渲染之前 DOM 元素已经就绪。
 */
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // 仅在开发调试时输出，帮助定位 index.html 的结构问题
  console.error("Root element not found. Please check index.html.");
}
