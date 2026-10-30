package handlers

import (
	"net/http"
	"time"
	"todo_api/internal/config"
	"todo_api/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

func LoginHandler(pool *pgxpool.Pool, cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var loginRequest LoginRequest

		if err := c.BindJSON(&loginRequest); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		user, err := repository.GetUserByEmail(pool, loginRequest.Email)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}
		// 把存在db的加鹽密碼跟前端傳來的密碼比對
		// 例如，db中的密碼是 $2a$10$uyx7Xo1MTx1OYiBC4Gs.qO5NdWt2Wt55bGVDz.oOSHPKij23vf.Ni 這是加鹽後的密碼
		// uyx7Xo1MTx1OYiBC4Gs 就是加鹽本身，當使用者登入的時候，會拿 uyx7Xo1MTx1OYiBC4Gs 這段+使用者輸入的密碼進行加鹽，若加鹽後跟db的加鹽後一致，則等於密碼相同
		// Authorization: 是賦予權限， Authentication是進行權限驗證
		err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginRequest.Password))

		if err != nil {
			// 密碼錯誤代表沒成功被賦予權限，所以失敗
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}

		// creating, signing, and encoding a JWT token using the HMAC signing method （也就是 HS256、HS384、HS512）
		// 登入時「建立 token 的 claims」，之後解析時也是使用 MapClaims
		t := jwt.NewWithClaims(jwt.SigningMethodHS256,
			jwt.MapClaims{
				"user_id": user.ID,
				"email":   user.Email,
				"exp":     time.Now().Add(24 * time.Hour).Unix(), // Unix() 代表 UTC 秒數時間戳
				// JSON 裡的 number decode 後預設會變成 float64
			})

		tokenString, err := t.SignedString([]byte(cfg.JWTSecret)) // 這邊用 HS256演算法

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token: " + err.Error()})
			return
		}

		c.SetCookie(
			"token",     // cookie 名稱
			tokenString, // cookie 值
			3600*24,     // maxAge，秒
			"/",         // path
			"",          // domain，localhost 通常留空
			false,       // secure，本地開發先 false；正式上線 HTTPS 要 true
			true,        // httpOnly
		)

		c.JSON(http.StatusOK, gin.H{
			"message": "login success",
		})
	}
}
