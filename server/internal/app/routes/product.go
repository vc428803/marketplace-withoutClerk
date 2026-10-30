package routes

import (
	"todo_api/internal/handlers"
	"todo_api/internal/stream"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// RegisterProductRoutes 註冊 product 相關 routes
//
// 這個檔案目前負責：
// 1. products 的 REST API
// 2. products 的 SSE stream
// 3. 暫時一併放 users 查詢 route
//
// 不處理：
// - DB 連線建立
// - products cache 初始化
// - handler 內部邏輯
//
// 只做一件事：把 product domain 相關 endpoint 掛到 router 上
func RegisterProductRoutes(
	router *gin.Engine,
	pool *pgxpool.Pool,
	productsCache *stream.ProductsCache,
) {
	// Products SSE：
	router.GET("/products/stream", handlers.ProductsSseHandler(productsCache))

	// 建立 product
	router.POST("/products", handlers.CreatteProductHandler(pool))

	// 查詢所有 products
	router.GET("/products", handlers.GetAllProductsHandler(pool))

	// 更新指定 id 的 product
	router.PUT("/products/:id", handlers.UpdateProductHandler(pool))

	// 查詢單一 product 詳細資料
	router.GET("/products/:id", handlers.GetProductByIDHandler(pool))

	// 依條件搜尋 products
	router.GET("/products/search", handlers.ListProductsHandler(pool))
}
