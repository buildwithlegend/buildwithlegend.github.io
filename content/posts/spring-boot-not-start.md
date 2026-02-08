---
title: Spring Boot 啟動失敗怎麼辦？先用這 5 個檢查點定位問題
date: '2026-02-02'
slug: spring-boot-not-start
section: fix
category: 錯誤排除
category_slug: troubleshooting
tags:
- Spring Boot
- 錯誤排除
- Java
views: 95
excerpt: Spring Boot 起不來通常不是單一原因：最常見的是 port 被占用、依賴版本衝突、設定檔寫錯、或環境變數缺失。用 5 個檢查點能快速縮小範圍。
---

## 1) 先別慌：Spring Boot 起不來通常有「套路」

新手遇到 Spring Boot 啟動失敗，常常會盯著一大堆 log 發呆。

先記住一個原則：  
✅ **真正的錯誤，多半在最後 20~40 行**  
✅ 前面一堆都是「連鎖反應」

---

## 2) 5 個檢查點（依常見程度排序）

### (1) Port 被占用（超常見）
你可能會看到像：
- `Address already in use`
- `Port 8080 was already in use`

解法（擇一）：
- 把占用的程式關掉
- 或在 `application.yml` 改成：
  ```yml
  server:
    port: 8081
  ```

---

### (2) 設定檔寫錯（縮排、key 拼錯）
`application.yml` 最容易踩坑是「縮排」。

建議做法：  
- 先把最近改的設定註解掉
- 一段一段加回去

---

### (3) 依賴版本衝突（NoSuchMethodError / ClassNotFound）
如果看到：
- `NoSuchMethodError`
- `ClassNotFoundException`

通常是：
- 你引入了不相容的版本
- 或同一個 library 被拉了兩份版本

做法：
- Maven：看 `mvn dependency:tree`
- Gradle：看 `./gradlew dependencies`

---

### (4) JDK 版本不對
如果你專案要求 Java 17，但你用 Java 8 跑，會出現奇怪錯。

確認：
- IntelliJ 的 Project SDK
- 以及你用 terminal 跑的 `java -version`

---

### (5) Profile / 環境變數缺失
例如你用了：
- `SPRING_PROFILES_ACTIVE=prod`
- 但 prod 的設定檔不存在或缺少 DB 連線資訊

做法：
- 先用 `dev` 或 `local` 起來
- 確認最小可跑後再切回 prod

---

## 3) 最推薦的 debug 方式：先做「最小可跑」

你可以先把專案縮到：

- 只保留一個 Controller
- 不連 DB、不連外部服務
- 先確認能起來

這樣你才知道問題是：
- 「程式碼」
- 還是「外部依賴/環境」

---

## 重點整理

- 真正的錯誤通常在最後 20~40 行
- 最常見：port、設定檔、依賴衝突、JDK、profile
- 先做最小可跑，再加功能回去
