package routes

import (
	"todo_api/internal/chat"

	"github.com/gin-gonic/gin"
)

// 這個檔案只負責即時聊天室的 websocket 入口註冊，
// 不處理：
// 1. chat room 初始化
// 2. router 初始化
// 3. WebSocket 內部訊息邏輯
//
// 只做一件事：把 /ws 掛到 router 上
func RegisterWebSocketRoutes(router *gin.Engine, chatRoom *chat.Room) {
	router.GET("/ws", func(c *gin.Context) {
		chatRoom.ServeHTTP(c.Writer, c.Request)
	})
}
