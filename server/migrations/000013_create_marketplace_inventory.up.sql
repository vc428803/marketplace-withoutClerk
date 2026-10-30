
-- 1. 遊戲物品定義
CREATE TABLE item_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    item_code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,

    category VARCHAR(50) NOT NULL DEFAULT 'other'
        CHECK (category IN (
            'equipment',
            'consumable',
            'material',
            'other'
        )),

    is_tradeable BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Marketplace 玩家背包
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    owner_id UUID NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,

    item_definition_id UUID NOT NULL
        REFERENCES item_definitions(id) ON DELETE RESTRICT,

    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
        CHECK (status IN (
            'AVAILABLE',
            'LISTED'
        )),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 查詢某玩家的背包
CREATE INDEX idx_inventory_items_owner
ON inventory_items(owner_id);

-- 依玩家和物品狀態查詢
CREATE INDEX idx_inventory_items_owner_status
ON inventory_items(owner_id, status);

-- 查詢物品種類
CREATE INDEX idx_inventory_items_definition
ON inventory_items(item_definition_id);
