package handlers

import (
	"errors"
	"net/http"
	"net/mail"
	"strings"
	"todo_api/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func RegisterHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req RegisterRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "email and password are required",
			})
			return
		}

		req.Email = strings.ToLower(strings.TrimSpace(req.Email))

		parsedEmail, err := mail.ParseAddress(req.Email)
		if err != nil || parsedEmail.Address != req.Email {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "invalid email format",
			})
			return
		}

		if len(req.Password) < 12 || len(req.Password) > 72 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "password must be between 12 and 72 bytes",
			})
			return
		}

		passwordHash, err := bcrypt.GenerateFromPassword(
			[]byte(req.Password),
			bcrypt.DefaultCost,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "failed to process registration",
			})
			return
		}

		user, err := repository.CreateUser(
			pool,
			req.Email,
			string(passwordHash),
		)

		if err != nil {
			var pgErr *pgconn.PgError

			if errors.As(err, &pgErr) && pgErr.Code == "23505" {
				c.JSON(http.StatusConflict, gin.H{
					"error": "email already registered",
				})
				return
			}

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "registration failed",
			})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"id":    user.ID,
			"email": user.Email,
		})
	}
}
