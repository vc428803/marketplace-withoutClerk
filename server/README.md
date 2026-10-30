# NEXELYTH Marketplace — Backend

**Go · Gin · PostgreSQL · JWT · REST API · WebSocket · SSE**

NEXELYTH Marketplace Backend is a Go-powered trading service designed to support digital asset management, auction transactions, and future integration with the NEXELYTH virtual world.

本專案使用 **Go + Gin Framework** 建立後端服務，採用 **Neon PostgreSQL** 管理使用者、玩家背包、虛擬貨幣錢包及競拍資料。

目前 Marketplace Web 已透過 REST API 與 Go Backend 通訊，並由後端統一負責身分驗證、資料存取及交易業務規則。

未來將進一步整合 [NEXELYTH Unity VR](https://github.com/vc428803/NEXELYTH)，讓 Web 與 VR Client 透過共用後端服務管理玩家身分及數位資產。

> **Project Status:** Active Development
>
> 主要 REST API、Authentication、Inventory、Wallet、Auction Listing、Ownership Validation 及 Transactional Listing 已有對應實作。
>
> 完整競拍結算、資產所有權轉移及 Unity VR 跨平台同步仍屬後續開發階段。

---

## 1. Architecture Overview

### Current Architecture

目前已實作的 Web Marketplace 架構：

```text
         Marketplace Web
          React + TypeScript
                 |
                 | HTTP / REST API
                 | JWT Cookie
                 v
           Go Backend API
            Gin Framework
                 |
       +---------+---------+
       |         |         |
       v         v         v
     Auth     Inventory  Auctions
       |         |         |
       +---------+---------+
                 |
          Wallet / Products
                 |
                 v
          Repository Layer
                 |
             pgxpool
                 |
                 v
         Neon PostgreSQL
```

Web Client 不直接連線 PostgreSQL，而是透過 Go Backend 的 API 存取資料。

### Planned Cross-Platform Architecture

```text
       Marketplace Web        NEXELYTH Unity VR
       React / TypeScript          Unity
              |                      |
              |                      |
              +----------+-----------+
                         |
                         v
                    Go Backend
                     Gin API
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

Unity VR 的共用 API 整合仍屬後續開發範圍，此圖代表目標架構。

### Design Principles

- **API-Driven Client–Server Architecture** — Marketplace Web 透過 REST API 與 Go Backend 通訊，由後端統一處理身分驗證、業務邏輯及 Neon PostgreSQL 資料存取。Unity VR 未來亦將採用相同的 API 整合模式。
- **Backend as the Authority** — 玩家身分、物品所有權及交易規則由後端判定，而非完全信任前端提交的資料。
- **Shared Identity** — 使用者 UUID 作為 Web 與未來 Unity VR 共用身分的基礎。
- **Transactional Consistency** — 使用 PostgreSQL Transaction、Row-Level Locking 與資料庫約束維護交易一致性。
- **Modular Design** — 分離 API Routing、Request Handling 與 Database Access。
- **Incremental Development** — 採取漸進式開發與重構，逐步擴充功能並保留既有系統的穩定性。

---

## 2. Technology Stack

| Category | Technology |
|---|---|
| Programming Language | Go 1.25.5 |
| Web Framework | Gin |
| Database | PostgreSQL / Neon |
| Database Driver | pgx/v5、pgxpool |
| Authentication | JWT、bcrypt、HttpOnly Cookie |
| API Communication | REST API / JSON |
| Realtime Communication | WebSocket、SSE |
| Database Migration | golang-migrate |
| Development Tool | Air Hot Reload |
| Environment Configuration | godotenv |
| Version Control | Git / GitHub |

---

## 3. Project Structure

```text
marketplace-withoutClerk/
├── client/
│   └── src/
│
├── server/
│   ├── cmd/
│   │   ├── api/
│   │   │   └── main.go
│   │   └── seed-wallets/
│   │       └── main.go
│   │
│   ├── internal/
│   │   ├── app/
│   │   │   ├── routes/
│   │   │   ├── cors.go
│   │   │   ├── jobs.go
│   │   │   ├── router.go
│   │   │   └── routes.go
│   │   ├── chat/
│   │   ├── config/
│   │   ├── database/
│   │   ├── handlers/
│   │   ├── models/
│   │   ├── repository/
│   │   ├── stream/
│   │   └── utils/
│   │
│   ├── migrations/
│   ├── scripts/
│   │   └── migrate.ps1
│   ├── testdata/
│   ├── .air.toml
│   ├── .env.example
│   ├── go.mod
│   ├── go.sum
│   └── README.md
│
├── docs/
└── README.md
```

本地開發使用的 `server/.env` 不應納入 Git 版本控制。

### Directory Responsibilities

| Directory | Responsibility |
|---|---|
| `cmd/api` | Go API Server 入口 |
| `cmd/seed-wallets` | 錢包資料初始化工具 |
| `internal/app` | Router、Application 初始化及背景服務 |
| `internal/app/routes` | 各模組 API 路由註冊 |
| `internal/config` | 環境設定 |
| `internal/database` | PostgreSQL 連線池 |
| `internal/handlers` | HTTP Request / Response |
| `internal/models` | 資料模型及請求模型 |
| `internal/repository` | SQL 查詢、資料存取與 Transaction |
| `internal/chat` | WebSocket 通訊 |
| `internal/stream` | SSE 與資料快取 |
| `internal/utils` | 共用工具 |
| `migrations` | Database Schema 版本管理 |
| `scripts` | Migration 管理工具 |
| `testdata` | 測試資料 |

### Backend Application Flow

```text
HTTP Request
     |
     v
Gin Router
     |
     v
Handler
     |
     v
Repository
     |
     v
pgxpool
     |
     v
PostgreSQL
```

目前主要採用 Routes、Handlers、Repository 的分層方式，讓 HTTP 處理與資料庫存取維持職責分離。

---

## 4. Getting Started

### Requirements

- Go 1.25.5 或符合 `go.mod` 要求的版本
- Git
- Neon PostgreSQL
- Air（選用，開發階段 Hot Reload）
- golang-migrate（執行 Database Migration 時需要）

### Installation

在 Repository 根目錄執行：

```bash
cd server
go mod download
```

### Environment Configuration

在 `server` 目錄建立 `.env`：

```env
POSTGRES_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
POSTGRES_PORT=3000
JWT_SECRET=replace-with-your-own-secret
```

| Variable | Purpose |
|---|---|
| `POSTGRES_URL` | PostgreSQL Connection URL |
| `POSTGRES_PORT` | Go HTTP Server Port |
| `JWT_SECRET` | JWT Signing Key |

`POSTGRES_PORT` 是目前程式使用的設定名稱，實際控制的是 Go HTTP Server Port。

請勿將包含真實資料庫密碼或 JWT Secret 的 `.env` 提交至 Git。

### Start Backend

使用 Go：

```bash
go run ./cmd/api
```

開發階段使用 Air：

```bash
air
```

成功啟動時，預期出現：

```text
Successfully connected to PostgreSQL database
server starting on port 3000
Listening and serving HTTP on :3000
```

本地預設 API：

`http://localhost:3000`

目前 `.env` 透過工作目錄載入，因此建議在 `server` 目錄執行後端。

---

## 5. Database & Migration Management

Marketplace 使用 Neon PostgreSQL 儲存使用者、商品、玩家背包、虛擬貨幣錢包及競拍資料。

資料庫 Schema 透過 **golang-migrate** 進行版本管理，確保結構變更可以由 SQL Migration 檔案追蹤及重現。

### Verified Migration Version

截至 2026-10-31：

| Item | Value |
|---|---|
| Migration Versions | 000001–000014 |
| Migration Sets | 14 |
| SQL Files | 28 |
| Neon Recorded Version | 14 |
| Latest Migration | `000014_link_auction_inventory` |

已透過 `golang-migrate` CLI 查詢 Neon 的 Migration 版本紀錄，確認目前版本為 `14`。

版本查詢成功不代表已執行完整的資料表結構檢查。

### Migration History

| Version | Purpose |
|---|---|
| 000001 | Create Todos |
| 000002 | Create Products |
| 000003 | Create Users |
| 000004 | Create Tasks |
| 000005 | Create User Task Progress |
| 000006 | Create Event Points Configuration |
| 000007 | Create Rewards |
| 000008 | Create Events |
| 000009 | Create Auction Listings |
| 000010 | Create Auction Bids |
| 000011 | Add Auction Categories |
| 000012 | Create Wallet System |
| 000013 | Create Marketplace Inventory |
| 000014 | Link Auctions to Inventory |

每個 Migration 版本包含兩個 SQL 檔案：

```text
000015_example.up.sql
000015_example.down.sql
```

- `.up.sql` — 套用資料庫結構變更。
- `.down.sql` — 回滾對應的結構變更。

---

## 6. Repository & Documentation

### Main Repository

**NEXELYTH Marketplace**

https://github.com/vc428803/marketplace-withoutClerk

### Related Project

**NEXELYTH — Unity VR**

https://github.com/vc428803/NEXELYTH

兩個專案的長期目標是透過 Go Backend 建立跨平台玩家身分、數位資產及交易狀態整合。

### Documentation

- `../README.md` — Marketplace Project Overview
- `../docs/ROADMAP.md` — Development Roadmap
- `../docs/architecture/001-cross-platform.md` — Cross-Platform Architecture

---

**NEXELYTH Marketplace Backend**

*Building reliable trading infrastructure for interconnected virtual worlds.*