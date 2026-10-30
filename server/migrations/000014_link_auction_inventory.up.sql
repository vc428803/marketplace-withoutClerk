-- 讓競拍紀錄關聯到玩家背包中的實際物品
ALTER TABLE auction_listings
ADD COLUMN inventory_item_id UUID;

-- 確保物品確實存在
ALTER TABLE auction_listings
ADD CONSTRAINT fk_auction_inventory_item
FOREIGN KEY (inventory_item_id)
REFERENCES inventory_items(id)
ON DELETE RESTRICT;

-- 同一件物品不能同時存在兩筆進行中的競拍
CREATE UNIQUE INDEX uq_active_auction_inventory_item
ON auction_listings(inventory_item_id)
WHERE status = 'active'
  AND inventory_item_id IS NOT NULL;
