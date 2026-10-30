package handlers

import (
	"errors"

	"todo_api/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

var ErrUnauthenticated = errors.New("unauthenticated")

func AuthenticatedUserID(c *gin.Context, cfg *config.Config) (string, error) {
	tokenString, err := c.Cookie("token")
	if err != nil || cfg.JWTSecret == "" {
		return "", ErrUnauthenticated
	}

	token, err := jwt.Parse(
		tokenString,
		func(token *jwt.Token) (interface{}, error) {
			return []byte(cfg.JWTSecret), nil
		},
		jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}),
		jwt.WithExpirationRequired(),
	)

	if err != nil || token == nil || !token.Valid {
		return "", ErrUnauthenticated
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", ErrUnauthenticated
	}

	userID, ok := claims["user_id"].(string)
	if !ok || userID == "" {
		return "", ErrUnauthenticated
	}

	var id pgtype.UUID
	if err := id.Scan(userID); err != nil || !id.Valid {
		return "", ErrUnauthenticated
	}

	return userID, nil
}
