package routes

import (
	"todo_api/internal/config"
	"todo_api/internal/handlers"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func RegisterWalletRoutes(
	router *gin.Engine,
	pool *pgxpool.Pool,
	cfg *config.Config,
) {
	router.GET("/api/wallet", handlers.GetWalletHandler(pool, cfg))
}
