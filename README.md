# 🚗 老司机导航

> 开箱即用的分类导航页，支持自定义收藏和导入导出

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![预览](assets/images/preview.png)

## 特性

- 🔍 **一框两用** — 输入实时搜索站内所有链接的标题和描述；回车跳转搜索引擎
- 🔄 **多引擎切换** — 搜索框旁可切换 Google/必应/B站/知乎等 11 个搜索引擎
- 📌 **自定义链接** — 添加/编辑/删除个人收藏，支持导入/导出，存储于浏览器本地
- 🌓 **深色模式** — 跟随系统或手动切换，偏好自动保存
- 📱 **响应式布局** — 桌面 4 列到手机单列，自动适配各种屏幕
- 🕐 **时钟小组件** — 顶部实时显示日期时间
- ✅ **默认 SFW** — 日常内容安全，`?mode=nsfw` 可解锁额外分类（需年龄确认）

## 本地运行

无依赖，直接浏览器打开 `index.html`，或用任意静态服务器：

```bash
npx serve .
```

在线访问：<https://vance1145.github.io/old-driver-navi/>

## 技术栈

纯静态 HTML + CSS + JavaScript，零依赖，零构建工具。

## 架构

```
index.html
assets/
  css/style.css               # 全部样式，CSS 变量支持深浅主题
  js/
    data/init.js               # NAV_DATA = { categories: [] }
    data/{ai,tools,...}.js     # 各自 push 到 NAV_DATA.categories
    data/adult.js              # 动态加载（?mode=nsfw）
    utils/theme.js             # 主题切换与持久化
    utils/storage.js           # localStorage 封装
    components/widgets.js      # 时钟组件
    components/header.js       # 顶栏、搜索、搜索引擎选择
    components/linkCard.js     # 链接条目渲染与自定义链接操作
    components/category.js     # 分类卡片渲染
    app.js                     # App.init() 入口
```

## 添加分类

在 `assets/js/data/` 下新建 `.js` 文件：

```js
NAV_DATA.categories.push({
  id: "my-category",
  name: "我的分类",
  icon: "🌟",
  links: [
    { title: "示例站点", url: "https://example.com", desc: "描述文字（可选）", icon: "" }
  ]
});
```

然后在 `index.html` 的 `<body>` 中按顺序添加对应的 `<script>` 标签。

## 存储

所有用户数据存储在 `localStorage`，key 统一以 `navi-` 为前缀。
