---
<<<<<<< HEAD
title: "IntelliJ 匯入 Maven 專案：最少步驟，避免 module not specified"
date: "2026-02-02"
category: "IntelliJ"
tags: ["Maven","設定","排雷"]
excerpt: "新手最容易卡的不是程式，是 IDE 的匯入方式。這篇用最短路線讓你成功。"
slug: 002-intellij-import-maven
=======
title: IntelliJ 匯入 Maven 專案：新手最容易漏掉的 4 個設定
date: '2026-01-31'
slug: intellij-import-maven
section: backend
category: Spring / Java
category_slug: spring-java
tags:
- IntelliJ
- Maven
- Java
views: 60
excerpt: Maven 專案匯入失敗通常是：JDK 沒選、Maven 沒設定、未啟用 Auto-import、或 proxy/公司網路問題。照這 4 步做，成功率最高。
>>>>>>> cf7d887afd57a6ca0afd9bfaf7f496383a1ce104
---

## 1) 先講白話：匯入 Maven 不是「開資料夾」而已

很多新手會直接用 IntelliJ「Open 資料夾」，然後專案看起來有檔案，但：

- 依賴沒有下載
- `src/main/java` 不被識別
- Run 的時候一直錯

<<<<<<< HEAD
1. File → Open（選有 `pom.xml` 那層）
2. 沒自動識別：右鍵 `pom.xml` → Add as Maven Project
3. Maven 工具窗 → Reload All Maven Projects

=======
原因是：  
你沒有把它當成 Maven 專案匯入。

---

## 2) 正確匯入方式（最穩）

做法 A（推薦）：
- `File → Open` → 選 `pom.xml`

做法 B：
- 先 open 專案，再右鍵 `pom.xml` → `Add as Maven Project`

---

## 3) 新手最常漏掉的 4 個設定

### (1) Project SDK（JDK）
`File → Project Structure → Project SDK`

確保跟專案需求一致（例如 Java 17）。

---

### (2) Maven 的 JDK 也要設定
有些人 Project SDK 設好了，但 Maven 仍用舊 JDK。

到：
- `Settings → Build Tools → Maven → JDK`

---

### (3) 開啟 Auto-import
讓你改 `pom.xml` 之後能自動下載依賴。

- `Settings → Build Tools → Maven → Importing`
- 勾 `Import Maven projects automatically`

---

### (4) 公司網路 / Proxy（如果你一直下載失敗）
如果你看到依賴一直紅、下載超慢：

- 確認是否需要設定 proxy
- 或改用公司允許的 repository

---

## 4) 成功的判斷方式

你看到：

- Maven tool window 有你的專案
- `Dependencies` 不再紅
- `mvn test` 或 `mvn package` 能跑

---

## 重點整理

- 匯入 Maven ≠ 開資料夾
- 最穩方式：用 `pom.xml` 匯入
- 4 個關鍵：Project SDK、Maven JDK、Auto-import、Proxy
>>>>>>> cf7d887afd57a6ca0afd9bfaf7f496383a1ce104
