# Aurora Orbit Pro - deploy helper (PowerShell)
# 1) Build into dist/
node build.mjs

# 2) Copy dist output to repo root (GitHub Pages root deploy)
Copy-Item -Recurse -Force .\dist\assets .\
Copy-Item -Force .\dist\index.html .\
Copy-Item -Recurse -Force .\dist\post .\
Copy-Item -Recurse -Force .\dist\about .\
Copy-Item -Recurse -Force .\dist\tags .\
Copy-Item -Recurse -Force .\dist\tag .\
Copy-Item -Recurse -Force .\dist\categories .\
Copy-Item -Recurse -Force .\dist\category .\
Copy-Item -Recurse -Force .\dist\fix .\
Copy-Item -Recurse -Force .\dist\start .\
Copy-Item -Recurse -Force .\dist\tools .\
Copy-Item -Force .\dist\rss.xml .\
Copy-Item -Force .\dist\sitemap.xml .\
Copy-Item -Force .\dist\robots.txt .\

Write-Host "`n✅ Build & copy done. Now run:"
Write-Host "git add ."
Write-Host "git commit -m `"deploy`""
Write-Host "git push"
