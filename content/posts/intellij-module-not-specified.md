---
title: module not specified？IntelliJ 常見錯誤一次解決
date: 2026-02-07
category: 錯誤解決
tags: [IntelliJ, Maven]
views: 95
section: fix
slug: intellij-module-not-specified
---

## 中文版

看到這個錯誤通常會嚇一跳：

```
Error: module not specified
```

其實只是 IntelliJ 找不到你的模組。

### 解法
重新匯入專案：

👉 File → Open → 選 **pom.xml**

不要直接開資料夾。

---

## English Version

### module not specified — IntelliJ Fix

Cause: IntelliJ cannot detect the module.

**Fix:**  
Open the `pom.xml` instead of the folder.

