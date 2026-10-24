# Marketplace

### Full-Stack Trading Platform
**Go · Gin · React · PostgreSQL · WebSocket · SSE**

以 Go 與 React 開發的全端交易平台，涵蓋使用者認證、商品管理、競標交易與即時資料更新，並持續擴展跨平台數位資產交易能力。

本專案著重於後端 API 設計、資料庫建模、前後端狀態同步及模組化架構，同時作為 Marketplace 與 Unity VR 專案 **NEXELYTH** 的跨平台整合基礎。

> **Project Status:** Active Development  
> 核心交易平台已有可運作的 API；跨平台遊戲資產交易仍處於架構設計與逐步實作階段。

---

## 01. Project Overview｜專案概述

Marketplace 是一套以 Go 後端為核心的交易平台，透過 REST API 提供商品及競標資料，並運用 WebSocket、Server-Sent Events（SSE）支援即時資訊傳遞。

### 核心功能

| Module | Description |
|---|---|
| Authentication | Email / Password 登入、bcrypt 密碼驗證、JWT 與 HttpOnly Cookie |
| Product Management | 商品建立、查詢、更新及搜尋 |
| Auction System | 競標刊登、出價及競標歷史查詢 |
| Realtime Communication | WebSocket 與 SSE 即時通訊 |
| User Management | 使用者資料查詢與分頁 |
| Event & Task System | 活動任務、進度更新及相關 API |
| Cross-Platform Trading | Marketplace × NEXELYTH 數位資產交易整合規劃 |

---

## 02. Technology Stack｜技術架構

| Layer | Technologies |
|---|---|
| Frontend | React、Vite、TypeScript（逐步遷移）、JavaScript |
| State / Data Fetching | TanStack Query、React Context |
| Backend | Go、Gin Framework |
| Database | PostgreSQL、Neon Serverless PostgreSQL |
| Database Driver | pgx / pgxpool |
| Authentication | JWT、bcrypt、HttpOnly Cookie |
| Realtime | WebSocket、SSE |
| Database Migration | golang-migrate |
| Other | CRON、REST API、Git / GitHub |

### Architecture Overview

```text
                 Marketplace Web
                   React / Vite
                        |
                        | REST API / WebSocket / SSE
                        v
                 Golang Backend
                  Gin Framework
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
    Authentication   Products      Auctions
          |             |             |
          +-------------+-------------+
                        |
                        v
                  pgx / pgxpool
                        |
                        v
                Neon PostgreSQL
                        |
                        v
               Persistent Data
```

目前由 Golang API 統一處理資料存取與業務邏輯，前端不直接連線 PostgreSQL。

---

## 03. Engineering Highlights｜工程實作重點

### Authentication & Identity

使用 Go、Gin、bcrypt 與 JWT 實作使用者登入流程。

- 使用 bcrypt 驗證使用者密碼
- 透過 JWT Claims 保存使用者 UUID 與 Email
- 使用 HttpOnly Cookie 保存登入 Token
- 透過 `/auth/me` 驗證登入狀態
- 使用 PostgreSQL UUID 作為使用者識別

認證系統仍持續補強，包含註冊 API、JWT 驗證安全設定及正式環境 Cookie 政策。

### Auction & Database Design

競標模組以 PostgreSQL 儲存交易相關資料，透過後端 API 提供：

- 競標刊登
- 競標資料查詢
- 出價
- 出價歷史查詢
- 商品分類

競標併發控制、交易一致性及所有權轉移機制，將依跨平台交易需求持續檢查與完善。

### Realtime Data Communication

專案使用 WebSocket 與 SSE 建立即時通訊能力，並結合前端狀態管理支援資料更新。

系統設計上區分：

- REST API：資料查詢與操作
- WebSocket：雙向即時通訊
- SSE：伺服器單向事件推送

### Cloud Database Integration

已將 Golang 後端連接至 Neon PostgreSQL，並透過 `golang-migrate` 管理資料庫結構版本。

目前已完成：

- Neon 雲端 PostgreSQL 建立
- 11 組 SQL Migration 套用
- Golang API 雲端資料庫連線測試
- `/auth/me` 未登入狀態驗證

開發環境的敏感設定透過本機 `.env` 管理，不納入 Git 版本控制。

---

## 04. Cross-Platform Integration｜跨平台整合規劃

Marketplace 將逐步與 Unity VR 專案 **NEXELYTH** 整合，目標是建立共用使用者身分與遊戲資產交易機制。

預計由 Golang Backend 作為權威資料來源，負責使用者身分、物品所有權及交易狀態管理。

### Planned Trading Flow

```text
NEXELYTH VR Inventory
          |
          | Transfer
          v
      Trade Storage
          |
          | List Item
          v
   Marketplace Auction
          |
          | Purchase / Ownership Transfer
          v
   Buyer Claim Storage
          |
          | Claim
          v
   Buyer VR Inventory
```

設計原則：

- VR Inventory 與 Trade Storage 分離
- 已進入交易儲存區的物品不可同時於 VR 使用
- 物品所有權由後端統一管理
- 交易流程須防止重複出售與併發狀態衝突
- Unity VR 與 Marketplace 共用使用者 UUID
- Unity 透過 API 存取資料，不直接暴露資料庫憑證

> 此部分屬於規劃中的跨平台功能，並非目前已全部完成的系統。

詳細架構文件：

[Cross-Platform Architecture](docs/architecture/001-cross-platform.md)

---

## 05. Implementation Status｜目前進度

| Feature | Status |
|---|---|
| Go / Gin REST API | Implemented |
| PostgreSQL Database & Migrations | Implemented |
| Neon Cloud Database Connection | Implemented |
| Authentication Login / Me | Implemented |
| Product API | Implemented |
| Auction API | Implemented |
| WebSocket / SSE Routes | Implemented |
| User Registration API | In Progress |
| Authentication Security Hardening | In Progress |
| Cross-Platform Shared Identity | Planned |
| VR Trade Storage / Claim Storage | Planned |
| Cross-Platform Ownership Transfer | Planned |

`Implemented` 表示已有對應實作，不代表所有邊界情況、安全性與正式環境部署驗證均已完成。

---

## 06. Repository Structure｜專案結構

```text
marketplace-withoutClerk/
├── client/
│   └── src/
├── server/
│   └── golang-todos-restAPI-Auth/
│       ├── cmd/
│       ├── internal/
│       │   ├── app/
│       │   ├── handlers/
│       │   ├── models/
│       │   └── repository/
│       ├── migrations/
│       └── scripts/
├── docs/
│   ├── README.md
│   ├── ROADMAP.md
│   └── architecture/
│       ├── 001-cross-platform.md
│       └── images/
│           └── 001-cross-platform-architecture.jpg
└── README.md
```

---

## 07. Documentation｜技術文件

詳細開發規劃、系統架構及技術決策請參考：

- [Technical Documentation](docs/README.md)
- [Development Roadmap](docs/ROADMAP.md)
- [Cross-Platform Architecture](docs/architecture/001-cross-platform.md)
- [Architecture Diagram](docs/architecture/images/001-cross-platform-architecture.jpg)

---

## 08. Development Focus｜後續開發方向

目前優先事項：

1. 完善 Authentication 與使用者註冊流程
2. 強化 JWT 驗證及 Cookie 安全設定
3. 驗證競標流程的交易一致性與併發安全
4. 建立跨平台共用身分整合
5. 逐步實作 VR Trade Storage 與 Marketplace 交易流程

本專案持續迭代，詳細進度與架構決策以 `docs/ROADMAP.md` 及相關文件為準。
