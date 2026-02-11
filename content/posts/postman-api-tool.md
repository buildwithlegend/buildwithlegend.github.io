---
<<<<<<< HEAD
title: API 測試神器：Postman 新手指南
date: 2026-02-07
category: 工具推薦
tags: [Postman, API]
views: 110
section: tools
slug: postman-api-tool
=======
title: Postman 新手指南：3 步驟測試你的 API（不用寫前端）
date: '2026-02-04'
slug: postman-api-tool
section: tools
category: 工具推薦
category_slug: dev-tools
tags:
- Postman
- API
- 工具
views: 110
excerpt: Postman 讓你不用寫前端就能測 API：輸入網址、選方法、帶參數按送出。新手先學 GET/POST、Header、Body 就夠用。
>>>>>>> cf7d887afd57a6ca0afd9bfaf7f496383a1ce104
---

## 1) Postman 是什麼？為什麼需要它？

如果你在做後端 API，最常遇到的痛點是：

> 我明明寫好了 API，但我沒有前端可以點，怎麼知道它有沒有通？

Postman 就是用來解決這件事的：  
✅ 直接送 HTTP 請求  
✅ 看回傳內容（JSON / 文字 / 狀態碼）  
✅ 方便帶 Header、Token、Body

---

## 2) 你只要學會 3 個概念，就能上手

### (1) Method（請求方法）
新手先記兩個就好：

- GET：拿資料
- POST：送資料（通常是新增）

<<<<<<< HEAD
Download:  
https://www.postman.com/

=======
### (2) URL（網址）
例如：
```
http://localhost:8080/api/users
```

### (3) Response（回應）
重點看三個：

- 狀態碼：200/201/400/401/500
- 回傳內容：JSON 是不是你想要的
- 回應時間：太慢就要查

---

## 3) 3 步驟測試你的第一個 API

假設你有一支 API：

- GET `/api/health`

### Step 1：選方法 GET
### Step 2：貼上 URL
### Step 3：按 Send

如果看到：
- Status: 200
- Body: `ok`

代表你至少「打得到」後端。

---

## 4) 常見需求：我要帶 JSON（POST）

在 Postman 你要做兩件事：

1. Header 加：
   - `Content-Type: application/json`
2. Body → raw → JSON
   - 貼上你的 JSON

例如：

```json
{
  "name": "Alice",
  "age": 20
}
```

---

## 5) 最常見的錯誤與白話解釋

- 401：你沒帶 Token，或 Token 過期
- 403：你有 Token，但你沒權限
- 404：網址打錯，或後端沒有這個 API
- 500：後端程式爆了（去看 log）

---

## 重點整理

- Postman = 不用前端也能測 API
- 新手先學：GET/POST + Header + Body
- 狀態碼是你第一個線索：401/404/500 各代表不同方向
>>>>>>> cf7d887afd57a6ca0afd9bfaf7f496383a1ce104
