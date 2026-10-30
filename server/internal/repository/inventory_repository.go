package repository

import (
	"context"
	"fmt"
	"time"

	"todo_api/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

// GetInventoryItemsByOwnerID
// 根據玩家 ID，查詢該玩家 Marketplace 背包的所有物品。
func GetInventoryItemsByOwnerID(
	pool *pgxpool.Pool,
	ownerID string,
) ([]models.InventoryItemResponse, error) {

	// 設定資料庫查詢最長 5 秒
	ctx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)
	defer cancel()

	// JOIN 物品定義表，取得前端需要顯示的資料
	query := `
		SELECT
			i.id,
			d.item_code,
			d.name,
			COALESCE(d.description, ''),
			COALESCE(d.image_url, ''),
			d.category,
			d.is_tradeable,
			i.status
		FROM inventory_items i
		INNER JOIN item_definitions d
			ON i.item_definition_id = d.id
		WHERE i.owner_id = $1
		ORDER BY i.created_at DESC, i.id DESC
	`

	rows, err := pool.Query(ctx, query, ownerID)
	if err != nil {
		return nil, fmt.Errorf(
			"query inventory items: %w",
			err,
		)
	}
	defer rows.Close()

	items := make([]models.InventoryItemResponse, 0)

	for rows.Next() {
		var item models.InventoryItemResponse

		err := rows.Scan(
			&item.ID,
			&item.ItemCode,
			&item.Name,
			&item.Description,
			&item.ImageURL,
			&item.Category,
			&item.IsTradeable,
			&item.Status,
		)

		if err != nil {
			return nil, fmt.Errorf(
				"scan inventory item: %w",
				err,
			)
		}

		items = append(items, item)
	}

	// 檢查迭代過程中是否發生錯誤
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf(
			"iterate inventory items: %w",
			err,
		)
	}

	return items, nil
}
