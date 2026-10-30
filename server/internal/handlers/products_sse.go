package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
	"todo_api/internal/stream"

	"github.com/gin-gonic/gin"
)

/*
ProductsSseHandler
------------------
用途：
- 提供一個 SSE endpoint（例如 GET /products/stream）
- 讓前端用 EventSource 訂閱，後端主動推送產品資料
- 播放策略：每 5 秒推送 1 筆 product（依序）
- 更新策略：當 cache version 更新（cron 每小時刷新）後，播放指標 i 重置為 0，從新資料第一筆開始播

責任分工（非常重要）：
- Cron：負責從 DB 撈資料 → cache.Set(products)
- ProductsCache ：保存最新資料（記憶體快取）與版本
- SSE Handler（這裡）：只負責「播放」cache 裡的資料，不負責查 DB

目前的行為：
- 播完（i >= len(products)）後會停住，只繼續送 ping 等待下一次 cron 更新。
*/
func ProductsSseHandler(cache *stream.ProductsCache) gin.HandlerFunc {
	return func(c *gin.Context) {
		w := c.Writer
		r := c.Request

		/* =========================
		   (1) SSE 必要 headers
		   =========================
		   Content-Type: 告訴瀏覽器這是 SSE（EventSource 需要）
		   Cache-Control: 避免中間層快取
		   Connection: keep-alive，保持連線不中斷
		*/
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")

		/* =========================
		   (2) Flush 機制
		   =========================
		   SSE 必須「即時 flush」才會讓資料立刻送到前端。
		   http.NewResponseController 能對 writer 做 Flush()。
		*/
		rc := http.NewResponseController(w)

		/* =========================
		   (3) Client 斷線偵測
		   =========================
		   EventSource 關閉 / 斷線時，Context.Done() 會觸發
		   我們要退出 goroutine，避免 memory leak。
		*/
		clientGone := r.Context().Done()

		/* =========================
		   (4) 播放 tick：每 5 秒送一筆 product
		   ========================= */
		t := time.NewTicker(5 * time.Second)
		defer t.Stop()

		/* =========================
		   (5) Ping tick：保活
		   =========================
		   有些 proxy/負載均衡會在一段時間沒有資料時切斷連線，
		   我們用 SSE comment（: ping）定期送出，確保連線維持。
		*/
		pingT := time.NewTicker(25 * time.Second)
		defer pingT.Stop()

		/* =========================
		   (6) 播放狀態
		   =========================
		   i：下一次要送出的 product index（每個 client 一份）
		   這代表每個 client 都有自己的播放進度（per-client playback）
		*/
		i := 0

		/* =========================
		   (7) 取得快照（snapshot）
		   =========================
		   Snapshot() 回傳一份 copy 的 slice，避免播放時被 cron 更新改動。
		   version：用來判斷 cache 是否更新（更新就重抓快照 + i=0）
		*/
		snap := cache.Snapshot()
		products := snap.Products
		version := snap.Version

		/* =========================
		   (8) SSE 主迴圈（長連線）
		   =========================
		   select 同時監聽：
		   - clientGone：斷線就退出
		   - pingT：定期保活
		   - t：定期推送產品資料
		*/
		for {
			select {
			// SSE comment：以 ":" 開頭的行，EventSource 不會當成訊息事件
			case <-clientGone:
				log.Println("Products SSE client disconnected")
				return

			// Flush 讓 ping 立刻送到 client
			case <-pingT.C:
				if _, err := fmt.Fprintf(w, ": ping\n\n"); err != nil {
					log.Printf("unable to write ping: %v", err)
					return
				}
				if err := rc.Flush(); err != nil {
					log.Printf("unable to flush ping: %v", err)
					return
				}

			case <-t.C:
				curVer := cache.Version() // ✅ 只讀 int64（幾乎零成本）
				if curVer != version {
					cur := cache.Snapshot() // ✅ 只有版本變才 copy
					products = cur.Products
					version = cur.Version
					i = 0
				}

				// 沒有任何資料就跳過（等待 cron 塞資料）
				if len(products) == 0 {
					continue
				}

				/* =========================
				   (8-2) 播放完的行為
				   =========================
				   目前策略：播完就停住，等待下一次 cron 更新 version。
				   （前端不會再收到 product event，只會收到 ping）
				   若想循環播放：把 continue 改成 i=0
				*/
				if i >= len(products) {
					continue
				}

				/* =========================
				   (8-3) 組 SSE payload（JSON）
				   =========================
				   data: products[i] 是 models.Product（強型別）
				   附帶 index/total/version 讓前端好做 UI（進度、版本切換）
				*/
				payload := map[string]any{
					"type":    "product",
					"version": version,
					"index":   i,
					"total":   len(products),
					"data":    products[i], // ✅ models.Product（強型別）
					"ts":      products[i].CreatedAt.UnixMilli(),
				}

				b, err := json.Marshal(payload)
				if err != nil {
					log.Printf("unable to marshal payload: %v", err)
					return
				}
				/* =========================
				   (8-4) SSE 格式輸出 + Flush
				   =========================
				   SSE 每個事件格式：
				     event: <name>
				     data: <payload>
				     \n\n
				   \n\n 表示一個 event 結束。
				*/
				if _, err := fmt.Fprintf(w, "event: product\ndata: %s\n\n", b); err != nil {
					log.Printf("unable to write product: %v", err)
					return
				}
				if err := rc.Flush(); err != nil {
					log.Printf("unable to flush product: %v", err)
					return
				}
				// 前進到下一筆
				i++
			}
		}
	}
}
