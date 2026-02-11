---
title: "Spring Boot 新手第一次跑不起來？我用 15 分鐘帶你從紅字到成功啟動"
date: "2026-02-03"
category: "Spring Boot"
tags: ["Maven","IntelliJ","新手救援"]
excerpt: "把 org.springframework.boot does not exist、404 Whitelabel 等新手最常見的坑，整理成可複製的解法。"
slug: 001-spring-boot-first-run
---

# 先別急著改程式：你要先確定「專案真的被 Maven 管」

很多新手看到紅字就開始亂改程式，但最常見的原因其實是：**依賴沒有下載、專案沒有用 Maven 匯入**。

## 你會看到的典型錯誤

```text
java: package org.springframework.boot does not exist
```

或是能跑起來但瀏覽器顯示：

> Whitelabel Error Page (404)

## 一次到位的解法（照做就好）

1. IntelliJ：File → Open（選有 `pom.xml` 的資料夾）  
2. 右鍵 `pom.xml` → Add as Maven Project  
3. Maven 視窗 → Reload All Maven Projects  
4. 重新 Run `xxxApplication`

