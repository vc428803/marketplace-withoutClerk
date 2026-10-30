package routes

import (
	"todo_api/internal/handlers"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// 這個檔案只負責 user domain 的 route 註冊。
// 目前先放查看所有使用者清單這一條。
// 之後如果有更多後台 user 管理功能，
// 例如：查詢單一 user、更新 user、停用 user，
// 都可以繼續放在這個檔案裡。
func RegisterUserRoutes(router *gin.Engine, pool *pgxpool.Pool) {
	// 查詢所有已註冊使用者
	router.GET("/users", handlers.GetUsersHandler(pool))
}
