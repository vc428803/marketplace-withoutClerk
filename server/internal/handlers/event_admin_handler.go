// 這一步要做什麼 ? 新增一支後台 API handler，專門處理 POST /admin/events。

package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"
	"todo_api/internal/config"
	"todo_api/internal/models"
	"todo_api/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func CreateEventHandler(pool *pgxpool.Pool, cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.CreateEventRequest
		fmt.Println(">>> CreateEventHandler hit")
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
			return
		}

		if req.Event.EventID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "eventId is required"})
			return
		}

		if req.Event.Title == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "event title is required"})
			return
		}

		if req.PointsConfig.UnitLabel == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "pointsConfig.unitLabel is required"})
			return
		}

		if len(req.Milestones) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "milestones is required"})
			return
		}

		if len(req.Rewards) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "rewards is required"})
			return
		}

		if len(req.Tasks) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "tasks is required"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		err := repository.CreateEventWithDetails(ctx, pool, req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create event"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "event created successfully",
			"event": gin.H{
				"eventId": req.Event.EventID,
			},
		})
	}
}
