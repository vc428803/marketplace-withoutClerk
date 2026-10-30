package app

import (
	"log"

	"todo_api/internal/chat"
	"todo_api/internal/models"
	"todo_api/internal/repository"
	"todo_api/internal/stream"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/robfig/cron/v3"
)

// InitChatRoom 初始化聊天室，並啟動它的 goroutine
func InitChatRoom() *chat.Room {
	chatRoom := chat.NewRoom()
	go chatRoom.Run()
	return chatRoom
}

// InitProductsStreamServices 初始化 products stream 相關服務
// 這裡把 products cache 初始化 + 定時 refresh job 一次包起來，
// 讓 main.go 不需要知道太多底層細節。
func InitProductsStreamServices(pool *pgxpool.Pool, maxProductsForStream int) (*stream.ProductsCache, *cron.Cron) {
	productsCache := InitProductsCache(pool, maxProductsForStream)
	cr := StartProductsRefreshJob(pool, productsCache, maxProductsForStream)
	return productsCache, cr
}

// InitProductsCache 建立 products cache，並在啟動時先載入一次資料
func InitProductsCache(pool *pgxpool.Pool, maxProductsForStream int) *stream.ProductsCache {
	productsCache := stream.NewProductsCache(maxProductsForStream)

	products, err := repository.GetAllProducts(pool)
	if err != nil {
		log.Printf("initial refresh products failed: %v", err)
		return productsCache
	}

	log.Printf("products fetched from DB: %+v", products)

	products = limitProducts(products, maxProductsForStream)
	productsCache.Set(products)

	log.Printf("initial products cache loaded: %d products", len(products))
	return productsCache
}

// StartProductsRefreshJob 啟動排程，定時更新 products cache
func StartProductsRefreshJob(pool *pgxpool.Pool, productsCache *stream.ProductsCache, maxProductsForStream int) *cron.Cron {
	cr := cron.New()

	_, err := cr.AddFunc("@every 12h", func() {
		log.Println("cron job running: refresh products cache")

		products, err := repository.GetAllProducts(pool)
		if err != nil {
			log.Printf("cron refresh products failed: %v", err)
			return
		}

		products = limitProducts(products, maxProductsForStream)
		productsCache.Set(products)

		log.Printf("products cache updated: %d products", len(products))
	})
	if err != nil {
		log.Fatal(err)
	}

	cr.Start()
	return cr
}

// limitProducts 只保留前 N 筆 products
// 假設 repository.GetAllProducts 已經依照你想要的順序排好
func limitProducts(products []models.Product, n int) []models.Product {
	if n <= 0 || len(products) <= n {
		return products
	}
	return products[:n]
}
