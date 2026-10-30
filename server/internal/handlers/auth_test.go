package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"todo_api/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func TestMeHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	const secret = "test-only-jwt-secret"
	cfg := &config.Config{JWTSecret: secret}

	tests := []struct {
		name           string
		token          string
		expectedStatus int
	}{
		{
			name:           "missing cookie",
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name: "valid HS256 token",
			token: makeTestToken(t, jwt.SigningMethodHS256, jwt.MapClaims{
				"user_id": "test-user-id",
				"email":   "test@example.com",
				"exp":     time.Now().Add(time.Hour).Unix(),
			}, secret),
			expectedStatus: http.StatusOK,
		},
		{
			name: "expired token",
			token: makeTestToken(t, jwt.SigningMethodHS256, jwt.MapClaims{
				"user_id": "test-user-id",
				"email":   "test@example.com",
				"exp":     time.Now().Add(-time.Hour).Unix(),
			}, secret),
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name: "wrong signing algorithm",
			token: makeTestToken(t, jwt.SigningMethodHS512, jwt.MapClaims{
				"user_id": "test-user-id",
				"email":   "test@example.com",
				"exp":     time.Now().Add(time.Hour).Unix(),
			}, secret),
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name: "missing expiration",
			token: makeTestToken(t, jwt.SigningMethodHS256, jwt.MapClaims{
				"user_id": "test-user-id",
				"email":   "test@example.com",
			}, secret),
			expectedStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			router := gin.New()
			router.GET("/auth/me", MeHandler(cfg))

			req := httptest.NewRequest(http.MethodGet, "/auth/me", nil)

			if tt.token != "" {
				req.AddCookie(&http.Cookie{
					Name:  "token",
					Value: tt.token,
				})
			}

			recorder := httptest.NewRecorder()
			router.ServeHTTP(recorder, req)

			if recorder.Code != tt.expectedStatus {
				t.Errorf(
					"expected status %d, got %d: %s",
					tt.expectedStatus,
					recorder.Code,
					recorder.Body.String(),
				)
			}
		})
	}
}

func makeTestToken(
	t *testing.T,
	method jwt.SigningMethod,
	claims jwt.MapClaims,
	secret string,
) string {
	t.Helper()

	token := jwt.NewWithClaims(method, claims)
	signed, err := token.SignedString([]byte(secret))
	if err != nil {
		t.Fatalf("failed to sign test token: %v", err)
	}

	return signed
}
