# 老司机导航 🚗

精选互联网资源导航站 — 收录 AI 对话助手、在线工具、本地软件、游戏、动漫、影视、漫画、轻小说、电子书等分类。

![预览](assets/images/preview.png)

## 功能

- 🔍 **站点搜索** — 输入即搜标题/描述；前缀 `/` 启用多分类模糊匹配
- 📌 **自定义链接** — 添加/编辑/删除个人收藏，存储于浏览器本地
- 🌓 **深色模式** — 跟随系统或手动切换，偏好自动保存
- 🕐 **时钟小组件** — 顶部实时显示日期时间
- 🔞 **隐藏内容** — URL 追加 `?mode=nsfw` 解锁（需年龄确认）
- 📊 **点击统计** — 自动记录每个链接的点击次数

## 分类

| 分类 | 数量 |
|------|------|
| 🤖 对话 AI | 20 |
| 🛠 在线工具 | 29 |
| 💻 本地工具 | 25 |
| 🎮 游戏 | 10 |
| 🎬 影视 | 10 |
| 📖 动漫 | 10 |
| 🖼 漫画 | 13 |
| 📚 轻小说 | 7 |
| 📱 电子书 | 10 |
| 🔞 限制内容 | 10（需 `?mode=nsfw`） |

## 访问

<https://vance1145.github.io/old-driver-navi/>

## 本地运行

无依赖，直接浏览器打开 `index.html`，或用任意静态服务器：

```bash
npx serve .
```

## 技术栈

纯静态 HTML + CSS + JavaScript，零依赖，零构建工具。无需 npm/pnpm/yarn。

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
    utils/search.js            # 分类搜索
    components/widgets.js      # 时钟组件
    components/header.js       # 顶栏、搜索、搜索引擎选择
    components/linkCard.js     # 链接条目渲染
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
