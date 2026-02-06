# Aurora Orbit Pro — 自動管理（專業級）

你只要寫 `content/posts/*.md`，其餘全部自動：
- 自動生成：首頁、文章頁、標籤頁、分類頁
- 自動生成：RSS、sitemap.xml、robots.txt
- GitHub Actions：push 到 main → 自動 build → 自動部署 GitHub Pages

## 本機跑起來
```powershell
npm install
npm run build
npm run preview
```
打開 http://localhost:4173

## 上線（GitHub Pages）
1) 建立 repo（建議：你的帳號.github.io）
2) 推到 main 分支
3) GitHub → Settings → Pages → Source 選 GitHub Actions
4) Actions 跑完就上線

## 重要：改網址
打開 `build.mjs`，把 `SITE.url` 改成你的 Pages 網址（例如 https://legend.github.io）

## 發文流程（你每天只要做這件事）
1) 新增 Markdown：content/posts/004-xxx.md（照範例 front matter）
2) git add/commit/push
3) 等 1 分鐘，網站自動更新
