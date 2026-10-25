package handlers

import (
	"net/http"

	"todo_api/internal/config"
	"todo_api/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// GetMyInventoryHandler
// 查詢目前登入玩家的 Marketplace 背包
func GetMyInventoryHandler(
	pool *pgxpool.Pool,
	cfg *config.Config,
) gin.HandlerFunc {
	return func(c *gin.Context) {

		// 沿用競拍系統的 JWT Cookie 驗證
		userID, err := getUserIDFromCookie(c, cfg)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "unauthorized",
			})
			return
		}

		// 只查詢登入玩家自己的物品
		items, err := repository.GetInventoryItemsByOwnerID(
			pool,
			userID,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "failed to load inventory",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data": items,
		})
	}
}
