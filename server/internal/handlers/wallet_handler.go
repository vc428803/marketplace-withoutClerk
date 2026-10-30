package handlers

import (
	"errors"
	"net/http"

	"todo_api/internal/config"
	"todo_api/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func GetWalletHandler(
	pool *pgxpool.Pool,
	cfg *config.Config,
) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := AuthenticatedUserID(c, cfg)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "unauthorized",
			})
			return
		}

		wallet, err := repository.GetWalletByUserID(
			c.Request.Context(),
			pool,
			userID,
		)

		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "wallet not found",
			})
			return
		}

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "failed to load wallet",
			})
			return
		}

		c.JSON(http.StatusOK, wallet)
	}
}
