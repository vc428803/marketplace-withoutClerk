package handlers

import (
	"context"
	"net/http"
	"time"
	"todo_api/internal/config"
	"todo_api/internal/models"
	"todo_api/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func UpdateEventTaskProgressHandler(pool *pgxpool.Pool, cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, err := c.Cookie("token")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "not logged in"})
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(cfg.JWTSecret), nil
		})
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

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

		eventID := c.Param("eventId")
		taskID := c.Param("taskId")

		var req models.UpdateTaskProgressRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		updatedTask, err := repository.UpdateEventTaskProgress(ctx, pool, userID, eventID, taskID, req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update task progress"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "task progress updated successfully",
			"task":    updatedTask,
			"user": gin.H{
				"userId": userID,
			},
			"event": gin.H{
				"eventId": eventID,
			},
		})
	}
}
