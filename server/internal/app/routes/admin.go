package routes

import (
	"fmt"

	"todo_api/internal/config"
	"todo_api/internal/handlers"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// 這個檔案只負責 admin domain 的 route 註冊。
// 目前先放建立活動這一條。
// 之後如果有更多後台功能，例如：
// - 管理活動列表
// - 編輯活動
// - 刪除活動
// - 後台管理 rewards / tasks
// 都可以繼續放在這個檔案裡。
func RegisterAdminRoutes(router *gin.Engine, pool *pgxpool.Pool, cfg *config.Config) {
	fmt.Println(">>> registering POST /admin/events")
	router.POST("/admin/events", handlers.CreateEventHandler(pool, cfg))
	fmt.Println(">>> registered POST /admin/events")
}
