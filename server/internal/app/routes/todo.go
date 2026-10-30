package routes

import (
	"todo_api/internal/handlers"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// 註冊 todo 相關 API
func RegisterTodoRoutes(router *gin.Engine, pool *pgxpool.Pool) {
	// 建立 todo
	router.POST("/todos", handlers.CreateTodoHandler(pool))

	// 查詢所有 todos
	router.GET("/todos", handlers.GetAllTodosHandler(pool))

	// 依照 id 查詢單一 todo
	router.GET("/todos/:id", handlers.GetTodoByIDHandler(pool))

	// 更新指定 id 的 todo
	router.PUT("/todos/:id", handlers.UpdateToDoHandler(pool))
}
