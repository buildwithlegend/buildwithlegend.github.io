---
title: "IntelliJ 匯入 Maven 專案：最少步驟，避免 module not specified"
date: "2026-02-02"
category: "IntelliJ"
tags: ["Maven","設定","排雷"]
excerpt: "新手最容易卡的不是程式，是 IDE 的匯入方式。這篇用最短路線讓你成功。"
slug: 002-intellij-import-maven
---

# 目標：3 分鐘內把專案匯入成功

你只做對 2 件事：**開對資料夾**、**讓 IntelliJ 認得 Maven**。

## 正確匯入流程

1. File → Open（選有 `pom.xml` 那層）
2. 沒自動識別：右鍵 `pom.xml` → Add as Maven Project
3. Maven 工具窗 → Reload All Maven Projects

