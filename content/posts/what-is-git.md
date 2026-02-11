---
title: Git 是什麼？為什麼工程師一定要會
<<<<<<< HEAD
date: 2026-02-07
category: 新手必看
tags: [Git, 新手]
views: 150
section: start
slug: what-is-git
=======
date: '2026-02-07'
slug: what-is-git
section: start
category: 新手必看
category_slug: newbie
tags:
- Git
- 新手
views: 150
excerpt: Git 就像「程式的存檔系統」：你可以回到任何一個版本，知道誰改了什麼，也能和團隊安全地一起改同一份專案。
>>>>>>> cf7d887afd57a6ca0afd9bfaf7f496383a1ce104
---

## 1) 先用一句話記住 Git

Git 是一套 **版本控制系統**。

白話講：它就是「程式的存檔機器」——  
你每做完一個段落（例如修好 bug、加好功能），就存一個檔。之後就算改壞了，也能回到上一個正常版本。

---

## 2) 為什麼不用「資料夾備份」就好？

很多新手會這樣做：

- `project_v1/`
- `project_v2_final/`
- `project_v2_final_final/`

短期看似可行，但很快會爆炸：

1. **不知道差在哪**：v2 到底改了哪些檔？你只能靠記憶。
2. **很難回到某個特定狀態**：你想回到「能跑、但還沒加 A 功能」的版本，找不到。
3. **多人合作會崩**：大家各自改，最後合併像在拼圖。

Git 的價值就是：  
✅ 有「版本線」能追蹤改動  
✅ 有「合併」機制讓多人協作  
✅ 出事能回復，不用重做

---

## 3) 新手最常用的 5 個指令（先會這些就夠）

> 你不需要一開始就背全部指令。先把「流程」做熟。

### (1) 初始化專案（第一次）
```bash
git init
```
把目前資料夾變成 Git 管理的專案。

### (2) 看狀態（你現在在哪一步）
```bash
git status
```
最常用。它會告訴你哪些檔案改了、哪些準備要存檔。

### (3) 把變更加入暫存區（準備存檔）
```bash
git add .
```

### (4) 真的存檔（建立一個版本）
```bash
git commit -m "完成登入頁面"
```

### (5) 看歷史版本
```bash
git log
```

---

## 4) 新手最容易搞混：add vs commit

可以把它想像成「打包寄件」：

- `git add`：把要寄的東西放進箱子（但還沒寄）
- `git commit`：封箱、貼標籤、真的寄出（建立一個版本點）

---

<<<<<<< HEAD
- Go back in time  
- Track changes  
- Prevent disasters  

=======
## 5) 最小實作：你可以照著做一次（3 分鐘）

1. 在一個資料夾放一個 `README.md`
2. `git init`
3. `git add .`
4. `git commit -m "init"`
5. 改一下 README
6. 再 `git add .` + `git commit -m "update readme"`
7. `git log` 看看是否出現兩次 commit

做完你就懂 Git 的核心：  
「**把一連串改動變成一顆一顆可回去的版本點**」。

---

## 重點整理

- Git = 程式存檔系統（版本控制）
- 新手先熟：`init / status / add / commit / log`
- `add` 是準備，`commit` 才是正式存檔
- 每篇文章的頁首都會有「分類連結」，你可以沿著主題繼續讀
>>>>>>> cf7d887afd57a6ca0afd9bfaf7f496383a1ce104
