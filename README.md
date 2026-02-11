# Aurora Orbit (GitHub Pages)

這是一個超輕量靜態站（SSG）：
- 文章：`content/posts/*.md`（YAML frontmatter）
- 模板：`templates/*.html`
- 產出：`dist/`（由 GitHub Actions build 後部署到 Pages）

## ✅ 你日後新增文章怎麼做
1. 新增一篇 markdown：`content/posts/xxx.md`
2. `git add . && git commit -m "post: ..." && git push`
3. GitHub Actions 會自動 build 並部署（不用手動複製 dist 到 root）

## ✅ GitHub Pages 設定（一定要做一次）
到 GitHub Repo → **Settings** → **Pages**
- Source / Build and deployment：選 **GitHub Actions**

> 本 repo 已內建 `.github/workflows/pages.yml`，只要 Pages Source 改成 GitHub Actions 就會自動上站。

## 在本機預覽（可選）
```bash
npm i
npm run build
npm run preview
```

## 🌐 站內翻譯
右上角已加入語言選單（英文 / 日文 / 中文 / 西班牙文 / 韓文），套用在全站模板，因此 **未來所有文章都會自動支援翻譯**。
