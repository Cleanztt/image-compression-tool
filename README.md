# 图片压缩工具

这是一个基于Web的图片压缩工具，提供简单直观的界面，帮助用户快速压缩图片文件。

## 功能特点

- 支持PNG、JPG等常见图片格式
- 可自定义压缩比例
- 实时预览压缩效果
- 显示压缩前后文件大小对比
- 支持压缩后图片下载
- 优雅的苹果风格界面设计

## 技术栈

- 前端框架：React 18
- UI组件：Ant Design
- 图片处理：browser-image-compression
- 构建工具：Vite
- 包管理器：npm

## 开发环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

## 安装和运行

```bash
# 安装依赖
npm install

# 开发环境运行
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
src/
  ├── components/     # 组件目录
  ├── hooks/         # 自定义Hook
  ├── styles/        # 样式文件
  ├── utils/         # 工具函数
  ├── App.jsx        # 主应用组件
  └── main.jsx       # 入口文件
```
