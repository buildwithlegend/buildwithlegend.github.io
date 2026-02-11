---
title: 'IntelliJ: Module not specified（白話原因 + 3 步驟修好）'
date: '2026-02-03'
slug: intellij-module-not-specified
section: fix
category: 錯誤排除
category_slug: troubleshooting
tags:
- IntelliJ
- 錯誤排除
- Java
views: 80
excerpt: 看到 Module not specified 通常不是你程式寫錯，而是 IDE 沒有把專案「當成一個可執行的模組」載入。用重新匯入與設定 Run
  Configuration 多半能解。
---

## 1) 這個錯誤在說什麼（白話）

你按下 Run，IntelliJ 跟你說：

> Module not specified

白話翻譯：  
「我不知道你要跑哪一個模組（module）。」

很多新手會以為是程式寫錯，但其實通常是 **專案匯入方式** 或 **Run Configuration** 沒設定好。

---

## 2) 最常見原因（依機率排序）

1. 你是用「開資料夾」的方式打開專案，而不是用 Maven/Gradle 專案匯入  
2. 你的 Run Configuration 指到不存在的 module  
3. IntelliJ 的專案索引（index）壞掉或沒跑完

---

## 3) 3 步驟解法（照做就好）

### Step 1：確認你有用 Maven/Gradle 匯入
- 看到右側有 Maven 或 Gradle 的工具視窗  
- 或 `pom.xml` / `build.gradle` 有被識別（會有小圖示）

如果沒有：  
用 `File → Open` 選 `pom.xml` 重新開。

---

### Step 2：重建 Run Configuration
1. 右上角 Run 下拉 → `Edit Configurations...`
2. 找到有問題的設定（或直接刪掉）
3. 重新新增：
   - Spring Boot 就選 `Spring Boot`
   - 純 Java main 就選 `Application`

然後確認：
- `Module` 有選到正確專案（通常是 `xxx.main`）

---

### Step 3：Invalidate Caches（最後手段）
如果你做完 Step 1/2 還是不行：

`File → Invalidate Caches / Restart… → Invalidate and Restart`

這會讓 IntelliJ 重新索引專案。

---

## 4) 做完如何確認真的好了？

你按 Run 之後應該看到：

- Console 開始跑 log
- 或至少 main 方法有被執行

---

## 重點整理

- 這個錯誤多半是 IDE 設定，不是程式碼
- 先重新用 Maven/Gradle 匯入，再重建 Run Configuration
- 真的卡住才用 Invalidate Caches
