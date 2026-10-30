package routes

import (
	"todo_api/internal/config"
	"todo_api/internal/handlers"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// 這個檔案只負責競拍交易所 domain 的 route 註冊，
// 不處理：
// 1. DB 連線建立
// 2. config 載入
// 3. handler 內部競拍邏輯
//
// 只做一件事：把 auctions 相關 endpoint 掛到 router 上
func RegisterAuctionRoutes(router *gin.Engine, pool *pgxpool.Pool, cfg *config.Config) {
	// 建立競拍商品
	router.POST("/auctions", handlers.CreateAuctionListingHandler(pool, cfg))

	// 查詢所有競拍商品
	router.GET("/auctions", handlers.GetAuctionListingsHandler(pool))

	// 查詢單一競拍商品詳情
	router.GET("/auctions/:id", handlers.GetAuctionListingByIDHandler(pool))

	// 對指定競拍商品出價
	router.POST("/auctions/:id/bids", handlers.PlaceBidHandler(pool, cfg))

	// 查詢指定競拍商品的出價紀錄
	router.GET("/auctions/:id/bids", handlers.GetAuctionBidsHandler(pool))
}
