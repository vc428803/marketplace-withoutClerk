### 技術棧 🔧
> React、Tanstack Query、Postgres、Golang、Websocket、SSE、CRON

### 近期已完成
- [x] [26/0418] 新增刊登商品表單(有RWD)、優化DB(目前對競拍品多增加了類別這個要素)
- [x] [26/0412] 優化main.go裡的路由、CORS、Websocket、模組等架構，避免全部都擠在同一份檔案，造成閱讀成本增加，讓職責單一。
- [x] [26/0411] 預先規劃刊登文章多標籤篩選功能 [核心邏輯寫在這](https://github.com/Vic428-human/todoapp-jwt/blob/a77472f5b5b212622445fa7ba3b8d678d7bff54f/internal/repository/article_repository.go#L4)，之後完善後會搬遷過來這個專案。
- [x] [26/0402] 將角色與魔法陣改為共用定位容器並優化透明素材對位顯示
- [x] [26/0328] 競拍商品系統引入，可以看到當前最高價，有能看到歷史競拍紀錄
- [x] [26/0319] 顯示登入/登出狀態、使用者頭像
- [x] [26/0316] 製作一個 API，可依登入使用者 token 直接更新指定活動下指定任務的完成、可領取與可接取進度狀態。
- [x] [26/0315] 優化整體積分獎勵面板UI的 RWD，並串接積分獎勵API。
- [x] [26/0308] 後端表格規劃支援通用活動，包含 任務、里程碑分數、獎勵，採懶初始化；登入時回傳對應積分獎勵，未登入則隱藏，刷新只在確認登入後觸發 API。
- [x] [26/0307] 移除 Clerk，改用 app 最高層的 context provider 管理登入狀態：刷新時若 cookie 內有 token，則視為已登入，並透過驗證 API 確認有效性；聊天大廳的 user info 由 JWT 解構，不再依賴 Clerk、Redux 或 localStorage。
- [x] [26/0224] 新增會員專區Nested Routing、忘記密碼、會員註冊..等功能，優化
- [x] [26/0220] 首頁推播公告，透過SSE、CRON排程將刊登過的產品推播至前台頁面
- [x] [26/0219] 聊天室widget化，玩家可以自由開啟關閉，購物同時跟其他使用者聊天
- [x] [26/0218] 添加多人聊天室，可以看到其他玩家正在輸入..等功能
- [x] [26/0217] 交易市集虛寶查詢，並優化效能，避免相同關鍵字短時間查詢時反覆呼叫API
- [x] [26/0217] 把傳統路由升級成 createFileRoute ，檔案名自動變路由，優點如下:
- [x] [26/0214] 刊登賣場 串接 post 方法


### 備忘
- 本機位置: C:\Users\z0983\Documents\sideProject\marketplace-withoutClerk