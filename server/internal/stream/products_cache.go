package stream

import (
	"sync"
	"time"
	"todo_api/internal/models"
)

/*
ProductsSnapshot
----------------
代表「某一個時間點」的產品快照。

SSE handler 不會直接讀 cache 內部資料，
而是透過 Snapshot() 拿到一份 copy 出來的安全版本。

這樣可以避免：
- 在播放途中資料被 cron 更新
- data race（讀寫衝突）
*/
type ProductsSnapshot struct {
	Products  []models.Product // 當前所有產品（順序由資料來源決定，例如 SQL ORDER BY）
	Version   int64            // 每次 cron 更新會 +1
	UpdatedAt time.Time        // 上次更新時間（方便 debug / log）
}

/*
ProductsCache
-------------
這是整個系統的「共享記憶體層」。

責任分工：
- Cron（每小時） → 呼叫 Set() 寫入新資料
- SSE handler → 呼叫 Snapshot() 讀資料
- REST API → 不應該直接碰這個 cache

為什麼需要 RWMutex？
- 可能同時有多個 SSE client 在讀
- cron 會偶爾寫入（版本更新）
- 必須避免 data race
*/
type ProductsCache struct {
	mu        sync.RWMutex     // 讀寫鎖（多讀少寫）
	products  []models.Product // 實際儲存的產品資料
	version   int64            // 每次更新 +1，用來讓 SSE 判斷是否需要重播
	updatedAt time.Time        // 最後更新時間
	max       int
}

/*
NewProductsCache
----------------
在 main.go 啟動時建立一次。

⚠️ 千萬不要在 cron 裡面 new。
⚠️ 只能建立一次，然後注入到 handler。
*/
func NewProductsCache(max int) *ProductsCache {
	if max <= 0 {
		max = 10
	}
	return &ProductsCache{
		products:  make([]models.Product, 0),
		version:   0,
		updatedAt: time.Now(),
		max:       max,
	}
}

/*
Set
---
由 cron 呼叫。

功能：
1. 用 Lock() 取得寫鎖
2. 複製一份新的 slice（避免外部 slice 影響內部）
3. 更新 products
4. version++
5. 更新 updatedAt

為什麼要 copy ？
避免外部傳進來的 slice 被改動時，
影響到正在播放的 SSE。
*/
func (c *ProductsCache) Set(products []models.Product) {
	c.mu.Lock()
	defer c.mu.Unlock()

	n := c.max
	if len(products) < n {
		n = len(products)
	}

	// 建立新的 slice，避免直接引用原本的底層陣列
	cp := make([]models.Product, n)
	copy(cp, products[:n]) // Set() 用寫鎖、copy slice ✅

	c.products = cp
	c.version++              // 每次更新版本 +1
	c.updatedAt = time.Now() // 記錄更新時間
}

/*
Snapshot
--------
由 SSE handler 呼叫。

功能：
- 取得一份安全的資料副本（copy）
- 避免播放途中被 cron 改掉

注意：
Snapshot() 會 copy 整個 slice，
因此不應該在每 5 秒都呼叫，
應該先用 Version() 做版本檢查，
只有版本變動時才 Snapshot。
*/
func (c *ProductsCache) Snapshot() ProductsSnapshot {
	c.mu.RLock()
	defer c.mu.RUnlock()

	cp := make([]models.Product, len(c.products))
	copy(cp, c.products) // Snapshot() 用讀鎖、copy slice ✅

	return ProductsSnapshot{
		Products:  cp,
		Version:   c.version,
		UpdatedAt: c.updatedAt,
	}
}

/*
Version
-------
提供「便宜的版本檢查」。

用途：
SSE handler 每次 tick 時先比對 version，
只有 version 改變才 Snapshot()（避免每次都 copy 大 slice）。
*/
func (c *ProductsCache) Version() int64 {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.version
}
