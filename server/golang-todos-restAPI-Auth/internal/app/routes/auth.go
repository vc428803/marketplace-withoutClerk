package routes

import (
	"todo_api/internal/config"
	"todo_api/internal/handlers"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func RegisterAuthRoutes(router *gin.Engine, pool *pgxpool.Pool, cfg *config.Config) {
	router.POST("/auth/register", handlers.RegisterHandler(pool))
	router.POST("/auth/login", handlers.LoginHandler(pool, cfg))
	router.GET("/auth/me", handlers.MeHandler(cfg))
}
