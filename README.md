# 网页收藏导航 (Bookmark Navigator)

完全复刻自 [nav.iowen.cn/bookmark](https://nav.iowen.cn/bookmark) 的纯前端书签导航页。

## 功能特性

- 🖼️ **随机壁纸背景** - 自动加载精美壁纸，支持模糊/亮度调节
- ⏰ **实时时钟** - 时:分:秒 动态显示
- 🔍 **多引擎搜索** - 百度/Google/Bing/搜狗/360/DuckDuckGo 搜索引擎切换
- 📑 **书签管理** - 添加/编辑/删除/拖拽排序书签图标
- 🎨 **自定义图标** - 在线图标/上传图标/纯色图标/链接图标 4种模式
- 📂 **文件夹支持** - 图标可整理到文件夹中
- 💾 **本地存储** - 所有数据保存在浏览器的 localStorage 中

## 使用说明

1. 直接用浏览器打开 `index.html`
2. 双击页面空白区域可添加书签
3. 右键点击书签可编辑或删除
4. 拖拽书签可调整顺序

## 项目结构

```
navmacbook/
├── index.html              # 主页面
├── css/
│   ├── bm.css              # 主样式（从原站下载）
│   ├── iconfont.css        # 图标字体
│   └── cropper.min.css     # 图片裁剪
├── js/
│   ├── bm.js               # 原站主脚本（参考用）
│   └── app.js              # 自研应用逻辑
├── assets/
│   ├── favicon.svg          # 网站图标
│   └── search-icons/        # 搜索引擎图标
├── docs/
│   ├── CONTEXT.md           # 上下文需求文档
│   ├── PLAN.md              # 执行计划
│   ├── GIT_LOG.md           # Git 提交日志
│   └── BUG_LOG.md           # Bug 日志
└── README.md
```

## 技术栈

- 原生 HTML5 + CSS3
- jQuery（兼容原站插件）
- Sortable.js（拖拽排序）
- Cropper.js（图片裁剪）
- ES6+ JavaScript
- localStorage 数据持久化

## 后续扩展

本项目为 1:1 复刻版本，后续将根据需求扩展更多功能。