---
title: Spring Boot 跑不起來？3 分鐘快速排查
date: 2026-02-07
category: 錯誤解決
tags: [Spring Boot, Java, 錯誤排查]
views: 120
section: fix
slug: spring-boot-not-start
---

## 中文版

剛開始學 Spring Boot 時，最讓人崩潰的就是「為什麼跑不起來？」  
其實大多數問題都非常好解決。

### Step1：確認 Java 版本
Spring Boot 3 需要 **Java 17 以上**

```
java -version
```

如果低於 17，升級即可。

### Step2：依賴還在下載
很多新手會以為壞掉，其實只是 Maven / Gradle 還沒下載完。

👉 等 IDE 跑完再試一次。

### Step3：Port 被佔用
常見錯誤：

```
Port 8080 already in use
```

解法：

```
netstat -ano | findstr 8080
```

關閉該程序即可。

---

## English Version

### Spring Boot Won’t Start? Fix It in 3 Minutes

Most startup issues are simple.

**1️⃣ Check Java Version**  
Spring Boot 3 requires Java 17+.

**2️⃣ Dependencies may still be downloading**  
Wait for Maven/Gradle.

**3️⃣ Port already in use**  
Kill the process using port 8080.

