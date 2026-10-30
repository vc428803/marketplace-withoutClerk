
package models

import "time"

// ItemDefinition 定義遊戲中有哪些物品種類
type ItemDefinition struct {
    ID          string    `json:"id" db:"id"`
    ItemCode    string    `json:"item_code" db:"item_code"`
    Name        string    `json:"name" db:"name"`
    Description string    `json:"description" db:"description"`
    ImageURL    string    `json:"image_url" db:"image_url"`
    Category    string    `json:"category" db:"category"`
    IsTradeable bool      `json:"is_tradeable" db:"is_tradeable"`
    CreatedAt   time.Time `json:"created_at" db:"created_at"`
    UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// InventoryItem 表示某位玩家持有的一件物品
type InventoryItem struct {
    ID               string    `json:"id" db:"id"`
    OwnerID          string    `json:"owner_id" db:"owner_id"`
    ItemDefinitionID string    `json:"item_definition_id" db:"item_definition_id"`
    Status           string    `json:"status" db:"status"`
    CreatedAt        time.Time `json:"created_at" db:"created_at"`
    UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}

// InventoryItemResponse 提供前端背包所需資訊
type InventoryItemResponse struct {
    ID          string `json:"id"`
    ItemCode    string `json:"item_code"`
    Name        string `json:"name"`
    Description string `json:"description"`
    ImageURL    string `json:"image_url"`
    Category    string `json:"category"`
    IsTradeable bool   `json:"is_tradeable"`
    Status      string `json:"status"`
}
