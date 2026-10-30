# NEXELYTH Marketplace — Frontend

**React · TypeScript · Vite · Tailwind CSS · TanStack Router · TanStack Query**

NEXELYTH Marketplace Frontend is a fantasy-themed trading platform designed for digital asset management, player inventory, and auction-based transactions.

本專案使用 **React + TypeScript + Vite** 建立前端介面，搭配 **Tailwind CSS** 進行樣式設計，並透過 **Go / Gin REST API** 串接玩家帳號、背包、競拍及虛擬貨幣等資料。

平台以奇幻世界的視覺風格呈現交易市場，未來將與 [NEXELYTH Unity VR](https://github.com/vc428803/NEXELYTH) 整合，逐步建立跨平台的數位資產交易體驗。

> **Project Status:** Active Development
>
> 已建立 Marketplace 主要介面、玩家資產中心、競拍殿堂及前端 API 通訊基礎。
>
> 完整競拍結算、跨平台物品移轉與 Unity VR 同步仍屬後續開發範圍。

---

## 1. Architecture Overview

### Current Architecture

目前 Marketplace Web 透過 REST API 與 Go Backend 通訊。

```text
          Marketplace Web
          React + TypeScript
                  |
        +---------+---------+
        |         |         |
        v         v         v
    Pages      Components   Hooks
        |         |         |
        +---------+---------+
                  |
             API Layer
                  |
             REST / JSON
                  |
                  v
             Go Backend
             Gin Framework
                  |
                  v
           Neon PostgreSQL
```

Frontend 負責畫面呈現、使用者互動、表單處理與 API 請求；身分驗證、資料存取及交易規則由 Go Backend 負責。

### Planned Cross-Platform Architecture

```text
       NEXELYTH Marketplace
          React / TypeScript
                  |
                  |
                  v
              Go Backend
                  ^
                  |
                  |
          NEXELYTH Unity VR
```

Web Marketplace 與 Unity VR 將逐步整合共用的玩家身分及數位資產服務。

Unity VR 的跨平台交易整合仍處於後續開發階段。

### Design Principles

- **Component-Based Architecture** — 使用 React Components 建立可重用的介面。
- **API-Driven Frontend** — 透過 REST API 與 Go Backend 交換資料，不直接連接 PostgreSQL。
- **TypeScript Integration** — 使用 TypeScript 定義 API 回應、資料模型及部分主要頁面的型別。
- **Client-Side Routing** — 使用 TanStack Router 管理頁面導覽。
- **Server-State Management** — 採用 TanStack Query 作為伺服器資料管理的技術基礎。
- **Responsive Design** — 使用 Tailwind CSS 建立適應不同螢幕尺寸的介面。
- **Progressive Development** — 持續將早期 JavaScript 程式逐步整理為 TypeScript。

---

## 2. Technology Stack

| Category | Technology |
|---|---|
| Frontend Framework | React 19 |
| Programming Language | TypeScript / JavaScript |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| Routing | TanStack Router |
| Data Fetching | Fetch API、Axios |
| Server-State Management | TanStack Query |
| State Management Libraries | React Context、Redux Toolkit |
| Icons | Lucide React |
| Animation | Framer Motion |
| Notifications | React Hot Toast |
| HTTP Communication | REST API / JSON |
| Realtime Support | WebSocket、SSE |
| Linting | ESLint |

部分依賴仍保留自早期開發階段，目前主要架構以 React、TypeScript、TanStack Router、Tailwind CSS 及 Go REST API 整合為核心。

---

## 3. Project Structure

```text
nexelyth-marketplace/
│
├── client/
│   ├── public/
│   │
│   ├── src/
│   │   ├── api/
│   │   ├── app/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── config/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── mock/
│   │   ├── pages/
│   │   ├── queries/
│   │   ├── types/
│   │   ├── utils/
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── routeTree.gen.ts
│   │
│   ├── package.json
│   └── README.md
│
├── server/
├── docs/
└── README.md
```

### Directory Responsibilities

| Directory | Responsibility |
|---|---|
| `public` | 靜態資源、圖片與介面素材 |
| `src/api` | API Request Functions |
| `src/app` | Application-Level Configuration |
| `src/assets` | 前端匯入使用的資源 |
| `src/components` | Reusable UI Components |
| `src/config` | API URL 等共用設定 |
| `src/context` | React Context |
| `src/hooks` | Custom React Hooks |
| `src/mock` | Mock Data |
| `src/pages` | Application Pages / Routes |
| `src/queries` | Query-Related Logic |
| `src/types` | TypeScript Type Definitions |
| `src/utils` | Shared Utilities |

### Frontend Application Flow

```text
User Interaction
        |
        v
    React Page
        |
        v
   UI Components
        |
        v
  API Request Layer
        |
        v
   Go REST API
        |
        v
  JSON Response
        |
        v
 React State Update
        |
        v
     UI Render
```

目前部分頁面直接呼叫 API，部分功能已抽出共用 API Function。前端仍持續進行模組化與 TypeScript 整理。

---

## 4. Getting Started

### Requirements

- Node.js（使用與專案 Vite 版本相容的版本）
- npm
- Git
- NEXELYTH Go Backend

### Installation

在 Repository 根目錄執行：

```bash
cd client
npm install
```

### Environment Configuration

在 `client` 目錄建立 `.env.local`：

```env
VITE_API_BASE_URL=http://localhost:3000
```

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Go Backend API Base URL |

若未設定 `VITE_API_BASE_URL`，目前前端 API 設定會使用：

```text
http://localhost:3000
```

Vite 的 `VITE_` 環境變數會暴露至前端建置結果，因此不應用於儲存資料庫密碼、JWT Secret 或其他敏感資訊。

### Start Frontend

啟動 Vite Development Server：

```bash
npm run dev
```

預設本地開發網址通常為：

```text
http://localhost:5173
```

實際 Port 以 Vite Terminal 顯示為準。

需要使用登入、背包及競拍等後端功能時，應另行啟動 Go API Server。

### Production Build

建立正式版本的前端靜態檔案：

```bash
npm run build
```

建置輸出至：

```text
client/dist/
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

執行專案目前設定的 ESLint 檢查。

---

## 5. Repository & Documentation

### Main Repository

**NEXELYTH Marketplace**

https://github.com/vc428803/nexelyth-marketplace

### Backend

Go / Gin Backend 位於相同 Repository：

`../server/`

Backend Documentation：

`../server/README.md`

### Related Project

**NEXELYTH — Unity VR**

https://github.com/vc428803/NEXELYTH

NEXELYTH Marketplace 將逐步與 Unity VR 專案整合，讓玩家透過 Web Marketplace 管理數位資產，並在未來支援跨平台物品交易及同步。

### Documentation

- `../README.md` — Marketplace Project Overview
- `../server/README.md` — Backend Architecture & Setup
- `../docs/ROADMAP.md` — Development Roadmap
- `../docs/architecture/001-cross-platform.md` — Cross-Platform Architecture

---

**NEXELYTH Marketplace Frontend**

*Creating a fantasy-themed trading experience for interconnected virtual worlds.*