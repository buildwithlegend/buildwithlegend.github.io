# Aurora Orbit (GitHub Pages)

這是一個超輕量靜態站（SSG）：
- 文章：`content/posts/*.md`（YAML frontmatter）
- 模板：`templates/*.html`
- 靜態輸出：`dist/`

## 開發
```bash
npm i
npm run build
npm run preview
```

## 部署
Push 到 `main`，GitHub Actions 會自動 build 並部署到 Pages。
