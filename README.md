# NEXELYTH Marketplace

### Full-Stack Fantasy Trading Platform

**React · TypeScript · Go · Gin · PostgreSQL · WebSocket · SSE**

NEXELYTH Marketplace is a fantasy-themed trading platform designed for player inventory management, auction-based transactions, and future cross-platform integration with virtual worlds.

NEXELYTH Marketplace 是一套以 **React + TypeScript** 與 **Go + Gin** 開發的全端交易平台，使用 **Neon PostgreSQL** 管理玩家身分、數位資產、虛擬貨幣錢包與競拍資料。

本專案著重於 REST API 設計、資料庫建模、物品所有權驗證、交易一致性及前後端整合，並作為未來與 **NEXELYTH Unity VR** 進行跨平台資產交易的基礎。

> **Project Status:** Active Development
>
> 已實作主要前後端架構、JWT Authentication、Marketplace Inventory、Wallet Query、Auction Listing、Bidding API 及交易一致性保護機制。
>
> 完整競拍結算、物品所有權轉移及 Unity VR 資產同步仍屬後續開發階段。

---

## 01. Project Overview｜專案概述

NEXELYTH Marketplace 以 Go Backend 為核心，透過 REST API 向 React Web Client 提供使用者、背包、錢包與競拍資料。

前端以奇幻世界為視覺主題，建立玩家資產中心、競拍刊登介面與 3D 旋轉木馬形式的競拍殿堂。

### Core Modules

| Module                     | Description                                 |
| -------------------------- | ------------------------------------------- |
| Authentication             | Email / Password、bcrypt、JWT、HttpOnly Cookie |
| Marketplace Inventory      | 玩家物品管理、物品定義及所有權驗證                           |
| Auction System             | 競拍建立、商品列表、詳情、出價及歷史紀錄                        |
| Wallet System              | 玩家虛擬貨幣餘額及交易紀錄資料模型                           |
| Product Management         | 商品查詢與管理 API                                 |
| Realtime Communication     | WebSocket 與 Server-Sent Events              |
| Cross-Platform Integration | 與 NEXELYTH Unity VR 整合的架構規劃                 |

目前 Marketplace 已建立主要交易 API 與資料模型，但不代表完整買賣結算流程已全部完成。

---

## 02. Technology Stack｜技術架構

| Layer             | Technologies                              |
| ----------------- | ----------------------------------------- |
| Frontend          | React 19、TypeScript、JavaScript、Vite 7     |
| UI / Styling      | Tailwind CSS 4、Lucide React、Framer Motion |
| Routing           | TanStack Router                           |
| State / Data      | React Context、TanStack Query              |
| Backend           | Go、Gin Framework                          |
| Database          | PostgreSQL、Neon                           |
| Database Driver   | pgx/v5、pgxpool                            |
| Authentication    | JWT、bcrypt、HttpOnly Cookie                |
| Realtime          | WebSocket、SSE                             |
| Migration         | golang-migrate                            |
| Development Tools | Air、ESLint、Git / GitHub                   |

Frontend 目前同時包含 JavaScript 與 TypeScript，並持續進行漸進式 TypeScript 整理。

### Architecture Overview

**Current Implementation**

```text
              NEXELYTH Marketplace
                    Web Client
                React / TypeScript
                        |
                        | REST API / JSON
                        | JWT Cookie
                        v
                   Go Backend
                  Gin Framework
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
    Authentication   Inventory     Auctions
          |             |             |
          +-------------+-------------+
                        |
                Wallet / Products
                        |
                        v
                   Repository
                        |
                 pgx / pgxpool
                        |
                        v
                Neon PostgreSQL
```

目前 Web Client 透過 Go REST API 存取資料，並不直接連接 PostgreSQL。

Go Backend 負責使用者身分驗證、資料庫存取、物品所有權檢查及交易相關業務規則。

未來 Unity VR 將逐步整合相同的 API 服務。

---

## 03. Engineering Highlights｜工程實作重點

### Authentication & Identity

使用 Go、Gin、bcrypt 與 JWT 建立使用者認證機制。

- Email / Password 使用者註冊與登入 API
- bcrypt 密碼雜湊驗證
- JWT 使用者身分識別
- HttpOnly Cookie 儲存登入憑證
- `/auth/me` 查詢目前登入使用者
- PostgreSQL UUID 使用者識別

認證相關的正式環境安全設定與完整測試仍持續完善。

### Inventory & Ownership Validation

Marketplace Inventory 使用兩層資料模型：

- `item_definitions`：定義物品種類、名稱、圖片、分類及可交易屬性。
- `inventory_items`：記錄玩家實際持有的物品、所有者與狀態。

背包 API 根據已驗證的使用者身分查詢物品，而非直接信任前端提交的玩家 ID。

競拍建立流程亦會驗證物品所有權、可交易狀態及刊登條件。

### Transactional Auction Listing

競拍刊登透過 PostgreSQL Transaction 管理資料變更，並結合：

- **Ownership Validation** — 確認玩家具有指定物品的所有權。
- **Row-Level Locking** — 透過 `SELECT ... FOR UPDATE` 控制同一物品的並行操作。
- **Atomic Transaction** — 協調競拍建立與背包物品狀態變更。
- **Database Constraints** — 使用 Foreign Key 與部分唯一索引保護資料一致性。
- **Rollback** — 在交易操作失敗時回滾未提交的資料變更。

Migration `000014` 將 `auction_listings` 與 `inventory_items` 建立關聯，並透過部分唯一索引防止同一物品同時存在多筆有效競拍刊登。

上述機制已有對應實作；完整端對端與高併發驗證仍需持續補強。

### Auction Interface

Frontend 已建立奇幻風格競拍殿堂，使用 CSS 3D Transform 呈現旋轉木馬形式的商品展示。

目前主要介面包括：

- Marketplace 競拍殿堂
- 競拍商品展示與詳情導覽
- 玩家資產中心
- Marketplace 背包
- 競拍刊登表單與確認介面

部分頁面已與後端 API 整合，部分提交流程仍在持續開發。

### Realtime Communication

Backend 已有 WebSocket 與 Server-Sent Events（SSE）基礎實作。

| Technology | Purpose                          |
| ---------- | -------------------------------- |
| REST API   | 資料查詢與業務操作                        |
| WebSocket  | 雙向即時通訊                           |
| SSE        | Server-to-Client Event Streaming |

競拍即時通知、交易結果推送及 VR Inventory 同步仍屬後續整合方向。

### Cloud Database & Migrations

系統使用 Neon PostgreSQL 作為資料庫，透過 `golang-migrate` 管理 Schema 版本。

截至 **2026-10-31**：

| Item                  | Status                          |
| --------------------- | ------------------------------- |
| PostgreSQL Connection | Implemented                     |
| Migration Versions    | 000001–000014                   |
| Neon Recorded Version | 14                              |
| Latest Migration      | `000014_link_auction_inventory` |

Migration Version 14 已透過 CLI 查詢確認；此項驗證不等同於完整 Schema Audit。

---

## 04. Cross-Platform Integration｜跨平台整合規劃

Marketplace 未來將與 [NEXELYTH Unity VR](https://github.com/vc428803/NEXELYTH) 整合，建立共用玩家身分及數位資產交易機制。

### Planned Architecture

```text
         Marketplace Web          NEXELYTH Unity VR
         React / TypeScript           Unity / C#
                |                         |
                |                         |
                +------------+------------+
                             |
                             v
                         Go Backend
                             |
                 +-----------+-----------+
                 |           |           |
                 v           v           v
              Identity    Inventory    Trading
                 |           |           |
                 +-----------+-----------+
                             |
                             v
                       PostgreSQL
```

### Planned Asset Trading Flow

```text
        NEXELYTH VR Inventory
                   |
                   | Transfer
                   v
              Trade Storage
                   |
                   | Create Listing
                   v
           Marketplace Auction
                   |
                   | Settlement
                   v
           Buyer Claim Storage
                   |
                   | Claim
                   v
            Buyer VR Inventory
```

整合計重點包括共用使用者 UUID、設交易空間與遊戲背包分離、後端驗證物品所有權，以及避免重複交易或資產複製。

> 以上流程為跨平台目標架構，尚未代表 Unity VR 與 Marketplace 已完成完整的資產交易整合。

詳細設計請參考 [Cross-Platform Architecture](docs/architecture/001-cross-platform.md)。

---

## 05. Implementation Status｜目前進度

| Feature                                  | Status              |
| ---------------------------------------- | ------------------- |
| Go / Gin REST API                        | Implemented         |
| React Frontend                           | Implemented         |
| Neon PostgreSQL Connection               | Implemented         |
| Database Migrations 000001–000014        | Version 14 Verified |
| User Registration / Login API            | Implemented         |
| JWT Authentication                       | Implemented         |
| Marketplace Inventory API                | Implemented         |
| Wallet Query API                         | Implemented         |
| Auction Listing API                      | Implemented         |
| Auction Bidding API                      | Implemented         |
| Inventory Ownership Validation           | Implemented         |
| Transactional Auction Listing            | Implemented         |
| Duplicate Active Listing Protection      | Implemented         |
| 3D Auction Hall Interface                | Implemented         |
| Full Auction Creation UI Integration     | In Progress         |
| Complete Auction Settlement              | Planned             |
| Wallet Settlement                        | Planned             |
| VR Shared Authentication Integration     | Planned             |
| Cross-Platform Inventory Synchronisation | Planned             |

**Status Definitions**

- **Implemented** — 已有對應程式碼實作。
- **In Progress** — 部分流程已實作，仍需整合。
- **Verified** — 已完成明確的驗證項目。
- **Planned** — 後續規劃功能。

`Implemented` 不代表已通過全部端對端、安全性、壓力或正式部署測試。

---

## 06. Repository Structure｜專案結構

```text
nexelyth-marketplace/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── config/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── queries/
│   │   └── types/
│   ├── package.json
│   └── README.md
│
├── server/
│   ├── cmd/
│   │   └── api/
│   ├── internal/
│   │   ├── app/
│   │   │   └── routes/
│   │   ├── config/
│   │   ├── database/
│   │   ├── handlers/
│   │   ├── models/
│   │   └── repository/
│   ├── migrations/
│   ├── scripts/
│   │   └── migrate.ps1
│   ├── go.mod
│   └── README.md
│
├── docs/
│   ├── README.md
│   ├── ROADMAP.md
│   └── architecture/
│       ├── 001-cross-platform.md
│       └── images/
│           └── 001-cross-platform-architecture.jpg
│
└── README.md
```

前端與後端採用獨立的程式目錄，並透過 REST API 進行資料交換。

詳細設定及啟動方式請參考：

- [Frontend README](client/README.md)
- [Backend README](server/README.md)

---

## 07. Documentation｜技術文件

| Document                                                                             | Description            |
| ------------------------------------------------------------------------------------ | ---------------------- |
| [Frontend README](client/README.md)                                                  | React 前端架構、技術棧及開發環境    |
| [Backend README](server/README.md)                                                   | Go 後端架構、資料庫及 Migration |
| [Technical Documentation](docs/README.md)                                            | 系統設計文件導覽               |
| [Development Roadmap](docs/ROADMAP.md)                                               | 跨平台整合規劃                |
| [Cross-Platform Architecture](docs/architecture/001-cross-platform.md)               | 共用身分與資產交易架構            |
| [Architecture Diagram](docs/architecture/images/001-cross-platform-architecture.jpg) | 跨平台系統設計圖               |

跨平台設計文件仍可能包含早期的規劃狀態；已實作功能應以目前程式碼及實際驗證結果為準。

---

## 08. Development Focus｜後續開發方向

目前開發重點：

1. 完成競拍刊登 UI 與 Go Backend 的端對端串接。
2. 實作競拍結算、錢包扣款及賣方收入。
3. 建立成交後的物品所有權轉移機制。
4. 補強交易一致性、高併發與自動化測試。
5. 逐步整合 NEXELYTH Unity VR 共用身分及物品同步。

本專案持續迭代，逐步建立具備跨平台整合能力的數位資產交易基礎設施。

---

**NEXELYTH Marketplace**

*Building a fantasy trading ecosystem across web and virtual worlds.*
