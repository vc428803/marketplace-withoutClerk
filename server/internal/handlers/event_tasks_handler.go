package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"
	"todo_api/internal/config"
	"todo_api/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func GetEventTasksHandler(pool *pgxpool.Pool, cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. 從 cookie 拿 token
		tokenString, err := c.Cookie("token")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "not logged in"})
			return
		}
		// 2. 解析 token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		// 3. 取出 claims 裡的 user_id
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid claims"})
			return
		}
		userID, ok := claims["user_id"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user_id"})
			return
		}

		// 4. 從 URL 取出 eventId
		eventID := c.Param("eventId")
		fmt.Printf(">>>user %s is fetching tasks for event %s\n", userID, eventID)

		// 5. 查詢資料庫
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		// 來源 tasks、user_task_progress 表
		tasks, err := repository.GetEventTasksByUser(ctx, pool, userID, eventID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch tasks"})
			return
		}
		// 來源 event_points_config、event_milestones 表
		pointsConfig, err := repository.GetEventPointsConfig(ctx, pool, eventID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch points config"})
			return
		}
		// 來源 rewards 表
		rewards, err := repository.GetEventRewards(ctx, pool, eventID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch rewards"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"event": gin.H{
				"eventId": eventID,
			},
			"points":  pointsConfig,
			"rewards": rewards,
			"tasks":   tasks,
			"user": gin.H{
				"userId": userID,
			},
		})
	}
}
