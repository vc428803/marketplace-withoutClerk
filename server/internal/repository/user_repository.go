package repository

import (
	"context"
	"fmt"
	"time"
	"todo_api/internal/models"
	"todo_api/internal/utils"

	"github.com/jackc/pgx/v5/pgxpool"
)

func GetUsers(pool *pgxpool.Pool, page int, pageSize int) (*models.UserListResponse, error) {
	var ctx context.Context
	var cancel context.CancelFunc

	// 資料庫查詢超時，超過 5 秒算超時
	ctx, cancel = context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	utils.PerformOperation(ctx)

	// 決定前面要先跳過多少筆資料
	// 第 1 頁：跳過 0 筆
	// 第 2 頁：跳過前 1 頁的資料
	// 第 3 頁：跳過前 2 頁的資料
	offset := (page - 1) * pageSize

	// 先查 users 總筆數
	var totalCount int
	var countQuery string = `SELECT COUNT(*) FROM users`

	err := pool.QueryRow(ctx, countQuery).Scan(&totalCount)
	if err != nil {
		return nil, fmt.Errorf("查詢 users 總數失敗: %w", err)
	}

	// 再查當前頁資料
	var query string = `
		SELECT id, email, created_at, updated_at
		FROM users
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := pool.Query(ctx, query, pageSize, offset)
	if err != nil {
		return nil, fmt.Errorf("查詢 users 失敗: %w", err)
	}
	defer rows.Close()

	var users []models.UserResponse

	for rows.Next() {
		var user models.UserResponse

		if err := rows.Scan(
			&user.ID,
			&user.Email,
			&user.CreatedAt,
			&user.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("讀取 user 失敗: %w", err)
		}

		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("讀取 users 失敗: %w", err)
	}

	// 向上取整
	totalPages := (totalCount + pageSize - 1) / pageSize
	if totalPages == 0 {
		totalPages = 1
	}

	response := &models.UserListResponse{
		Items:      users,
		Page:       page,
		PageSize:   pageSize,
		TotalCount: totalCount,
		TotalPages: totalPages,
	}

	return response, nil
}
