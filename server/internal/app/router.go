package app

import (
	"log"

	"todo_api/internal/config"

	"github.com/gin-gonic/gin"
)

// NewRouter 建立並回傳已完成基礎設定的 Gin router
func NewRouter(cfg *config.Config) *gin.Engine {
	router := gin.Default()

	// 後端先不要相信任何轉送過來的假 IP 資訊
	// TODO: 當你開始真的要辨識使用者真實 IP的時候，才要調整

	if err := router.SetTrustedProxies(nil); err != nil {
		log.Fatal(err)
	}

	// 掛上 CORS middleware
	router.Use(NewCorsMiddleware(cfg))

	return router
}

// TODO: when deploying behind nginx / cloudflare / load balancer,
// replace nil with trusted proxy IPs or CIDR ranges.
