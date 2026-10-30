package routes

import (
	"todo_api/internal/config"
	"todo_api/internal/handlers"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// RegisterInventoryRoutes 註冊 Marketplace 背包相關 API
func RegisterInventoryRoutes(
	router *gin.Engine,
	pool *pgxpool.Pool,
	cfg *config.Config,
) {
	// 查詢目前登入玩家的背包
	router.GET(
		"/api/inventory/me",
		handlers.GetMyInventoryHandler(pool, cfg),
	)
}
