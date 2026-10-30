package app

import (
	"time"

	"todo_api/internal/config"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// NewCorsMiddleware 建立 CORS middleware
func NewCorsMiddleware(cfg *config.Config) gin.HandlerFunc {
	corsConfig := cors.DefaultConfig()

	// 5173 是交易所前台，3001 是交易所後台
	corsConfig.AllowOrigins = []string{
		"http://localhost:5173",
		"http://localhost:3001",
	}

	corsConfig.AllowMethods = []string{
		"GET",
		"POST",
		"PUT",
		"PATCH",
		"OPTIONS",
	}

	corsConfig.AllowHeaders = []string{
		"Content-Type",
		"Content-Length",
		"Accept-Encoding",
		"X-CSRF-Token",
		"Authorization",
		"Accept",
		"Origin",
		"Cache-Control",
		"X-Requested-With",
	}

	// AllowCredentials = true，不然 cookie 不會成功
	corsConfig.AllowCredentials = true
	corsConfig.ExposeHeaders = []string{"Content-Length"}
	corsConfig.MaxAge = 12 * time.Hour

	return cors.New(corsConfig)
}
