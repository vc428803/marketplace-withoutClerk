-- 刪除 category 索引
DROP INDEX IF EXISTS idx_auction_listings_category;

-- 刪除 category 的限制條件
ALTER TABLE auction_listings
DROP CONSTRAINT IF EXISTS auction_listings_category_check;

-- 刪除 category 欄位
ALTER TABLE auction_listings
DROP COLUMN IF EXISTS category;