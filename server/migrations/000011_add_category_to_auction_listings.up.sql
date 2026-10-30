-- 為既有的 auction_listings 表新增商品分類欄位
-- 先給預設值 'other'，避免舊資料因為沒有 category 而失敗
ALTER TABLE auction_listings
ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'other';

-- 補上 category 的分類值限制
-- 目前第一版虛寶拍賣只允許這 5 種分類：
-- currency   = 遊戲幣
-- equipment  = 裝備
-- consumable = 消耗品
-- material   = 材料
-- other      = 其他
ALTER TABLE auction_listings
ADD CONSTRAINT auction_listings_category_check
CHECK (category IN ('currency', 'equipment', 'consumable', 'material', 'other'));

-- 建立 category 索引，方便之後列表頁做分類篩選
CREATE INDEX IF NOT EXISTS idx_auction_listings_category
ON auction_listings(category);