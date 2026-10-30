package routes

import (
	"todo_api/internal/config"
	"todo_api/internal/handlers"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func RegisterEventRoutes(router *gin.Engine, pool *pgxpool.Pool, cfg *config.Config) {
	router.GET("/events/:eventId/tasks", handlers.GetEventTasksHandler(pool, cfg))
	router.PATCH("/events/:eventId/tasks/:taskId/progress", handlers.UpdateEventTaskProgressHandler(pool, cfg))
}
