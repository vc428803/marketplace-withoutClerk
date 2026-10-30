package handlers

import (
	"fmt"
	"net/http"
	"todo_api/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func MeHandler(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		fmt.Println("MeHandler hit")
		tokenString, err := c.Cookie("token")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "not logged in"})
			return
		}

		token, err := jwt.Parse(
			tokenString,
			func(token *jwt.Token) (interface{}, error) {
				return []byte(cfg.JWTSecret), nil
			},
			jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}),
			jwt.WithExpirationRequired(),
		)

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid claims"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"user": gin.H{
				"id":    claims["user_id"],
				"email": claims["email"],
			},
		})
	}
}
