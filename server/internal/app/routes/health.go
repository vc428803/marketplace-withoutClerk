package routes

import "github.com/gin-gonic/gin"

// RegisterHealthRoutes 註冊基礎健康檢查與根路由
func RegisterHealthRoutes(router *gin.Engine) {
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message":  "測試專案啟動成功！",
			"status":   "success",
			"database": "connected",
		})
	})
}
