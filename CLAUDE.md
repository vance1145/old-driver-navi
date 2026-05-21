# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

老司机导航 — 纯静态导航网站，零依赖零构建。浏览器直接打开 `index.html` 即可运行，或 `npx serve .` 启动本地服务器。在线地址: <https://navi.old-driver.com>。

## 架构

整个应用通过全局命名空间对象协作，无模块系统，按 `<script>` 标签加载顺序执行：

1. **`NAV_DATA`** — 全局数据容器，`assets/js/data/init.js` 中定义为 `{ categories: [] }`，后续各 data 文件 `push` 分类数据
2. **`Storage`** — localStorage 封装，所有 key 以 `navi-` 为前缀，管理自定义链接的增删改查和导入导出
3. **`Theme`** — 主题管理，通过 `data-theme` 属性切换 CSS 变量，优先读取 localStorage，否则跟随系统偏好
4. **`Header`** — 顶栏渲染与交互：logo、搜索引擎选择（11 个引擎，支持网络检测自动选 Google/必应）、搜索框（输入搜索站内链接，回车跳转搜索引擎）、主题切换按钮
5. **`Category`** — 分类卡片渲染、搜索结果显示、自定义收藏区域的添加/导入导出按钮、分类内滚动事件处理
6. **`LinkCard`** — 单个链接条目的渲染，支持 favicon（通过 `favicon.png.pub` 代理获取）、自定义链接的编辑/删除操作
7. **`App`** — 应用入口，`DOMContentLoaded` 时调用 `App.init()`，协调所有组件初始化、模态框（添加/编辑链接、导入导出、主页引导、NSFW 年龄验证）、搜索、Toast 提示

## NSFW 模式

访问 `?mode=nsfw` 时动态加载 `assets/js/data/adult.js`，首次需通过年龄验证（结果存 sessionStorage）。

## 添加新分类

1. 在 `assets/js/data/` 下新建 `分类名.js`，内容为 `NAV_DATA.categories.push({ id, name, icon, links: [...] })`
2. 在 `index.html` 中按期望显示顺序添加 `<script src="assets/js/data/分类名.js"></script>`

## CSS 主题

所有颜色通过 `:root` 和 `[data-theme="dark"]` 下的 CSS 自定义属性控制，不要硬编码颜色值。
