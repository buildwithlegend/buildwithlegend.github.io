---
<<<<<<< HEAD
title: "Spring Boot 新手第一次跑不起來？我用 15 分鐘帶你從紅字到成功啟動"
date: "2026-02-03"
category: "Spring Boot"
tags: ["Maven","IntelliJ","新手救援"]
excerpt: "把 org.springframework.boot does not exist、404 Whitelabel 等新手最常見的坑，整理成可複製的解法。"
slug: 001-spring-boot-first-run
=======
title: Spring Boot 第一次跑起來：從建立專案到看到 Hello API
date: '2026-02-01'
slug: spring-boot-first-run
section: backend
category: Spring / Java
category_slug: spring-java
tags:
- Spring Boot
- Java
- 入門
views: 130
excerpt: 你只要做到三件事：建立專案、寫一個 Controller、打到 /hello。先有成功經驗，之後加資料庫或驗證才不會迷路。
>>>>>>> cf7d887afd57a6ca0afd9bfaf7f496383a1ce104
---

## 0) 目標（先說清楚）

這篇文章的目標很單純：

> 讓你 10~15 分鐘內看到一個可以回應的 API：`GET /hello`

只要你做出「最小可跑」，後面才有資格加資料庫、加登入、加微服務。

---

## 1) 建立專案（最推薦的方式）

用 Spring Initializr（網頁或 IDE 都行）：

必選：
- Java
- Spring Boot（選最新穩定版）
- Dependencies：
  - Spring Web

---

## 2) 先確認專案能啟動（不要急著改東西）

啟動後你應該會看到 log 類似：

- `Tomcat started on port(s): 8080`
- `Started ... in ... seconds`

如果起不來，先去看本站「錯誤排除」路線：  
多半是 JDK、依賴、或 port 問題。

---

## 3) 寫一支最小 API（Controller）

建立檔案：

`src/main/java/.../HelloController.java`

```java
@RestController
public class HelloController {

  @GetMapping("/hello")
  public String hello() {
    return "hello";
  }
}
```

---

## 4) 用瀏覽器或 Postman 打它

瀏覽器輸入：

<<<<<<< HEAD
1. IntelliJ：File → Open（選有 `pom.xml` 的資料夾）  
2. 右鍵 `pom.xml` → Add as Maven Project  
3. Maven 視窗 → Reload All Maven Projects  
4. 重新 Run `xxxApplication`

=======
```
http://localhost:8080/hello
```

看到 `hello` 就成功了。

---

## 5) 最重要的一句話：先把成功固定下來

你成功跑起來後，請馬上做兩件事：

1. 用 Git commit 存一個版本（這是你的「安全點」）
2. 寫一段筆記：你環境是什麼（JDK 版本、Spring Boot 版本）

之後你加功能改壞了，你就能回到這個版本。

---

## 重點整理

- 先做出 `GET /hello` 的最小成功
- 起不來先查：JDK / port / 依賴 / 設定檔
- 成功後立刻 commit，建立安全回復點
>>>>>>> cf7d887afd57a6ca0afd9bfaf7f496383a1ce104
