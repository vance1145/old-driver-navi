# AGENTS.md — 老司机导航

纯静态 HTML + CSS + JavaScript 导航页，零依赖、零构建工具。

## Quick start

- No dev server needed — open `index.html` in a browser, or serve with any static file server (e.g. `npx serve .`)
- No package manager, no build step, no CI/CD pipeline

## Architecture

```
index.html          ← entry point (loads scripts in order)
assets/
  css/style.css     ← all styles, CSS variables for light/dark theme
  js/
    data/init.js    ← NAV_DATA = { categories: [] }
    data/*.js       ← each pushes to NAV_DATA.categories (ai.js, tools.js, desktop.js, etc.)
    data/adult.js   ← dynamically loaded via ?mode=nsfw
    utils/          ← theme.js, storage.js, search.js
    components/     ← header.js, sidebar.js, linkCard.js, category.js, widgets.js
    app.js          ← main init orchestrator
```

## Script loading order (index.html) — must be preserved

1. `data/init.js` (defines `NAV_DATA`)
2. All category data files (push to `NAV_DATA.categories`)
3. `utils/*` (theme, storage, search)
4. `components/*` (widgets, header, linkCard, category)
5. `app.js` (calls `App.init()` on DOMContentLoaded)

## Data conventions

- Each data file calls `NAV_DATA.categories.push({ id, name, icon, links: [...] })`
- Each link: `{ title, url, desc, icon }` — `icon` is a base64-encoded URL via `favicon.png.pub/v1/<base64>`
- `adult.js` is NOT loaded by default; dynamically appended when `?mode=nsfw` is present (with age gate)

## NSFW mode

- Append `?mode=nsfw` to URL → dynamically loads `assets/js/data/adult.js` → shows age gate → stores consent in `sessionStorage` key `nsfw-consent`

## localStorage keys (all prefixed `navi-`)

| Key | Purpose |
|-----|---------|
| `navi-theme` | `light` or `dark` |
| `navi-custom-links` | user-added links |
| `navi-hidden-categories` | hidden category IDs |
| `navi-click-counts` | per-link click counters |
| `navi-homepage` | `"true"` if set as homepage |

## Search

- Type in search box → automatically searches link titles/descriptions across all categories
- Prefix query with `/` → uses the `Search` module (multi-category matching)
- No query → resets to full category view

## Conventions

- All text content in **Chinese** (UI labels, descriptions, commit messages)
- No tests, no linters, no typecheckers, no formatters
- No CI/CD — deployed manually to GitHub Pages via `gh-pages` branch or direct push
