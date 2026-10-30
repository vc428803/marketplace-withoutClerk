-- 建立拍賣商品主表
-- 這張表存的是「一場拍賣目前的狀態」(所以它不是在記錄每一次出價，而是在記錄這場拍賣的當前快照)
-- 例如一張卡片正在拍賣，這張表會記錄：
-- 誰上架的
-- 商品是什麼
-- 起標價多少
-- 目前最高價多少
-- 現在最高出價者是誰
-- 還有多久結束
-- 目前是否仍在競拍中
CREATE TABLE IF NOT EXISTS auction_listings (
    -- 每一筆拍賣 listing 自己的唯一 id
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 這筆拍賣是由哪個 user 上架的
    -- 對應 users(id)
    -- ON DELETE CASCADE 表示如果這個 user 被刪除，他的拍賣資料也一起刪掉
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- 商品名稱，例如：月夜貓卡片
    item_name VARCHAR(255) NOT NULL,

    -- 商品圖片網址，給前端顯示圖片用
    item_image_url TEXT NOT NULL,

    -- 商品描述，可填可不填
    item_description TEXT,

    -- 起標價
    -- CHECK (starting_price >= 0) 表示不能小於 0
    starting_price BIGINT NOT NULL CHECK (starting_price >= 0),

    -- 目前價格
    -- 一開始通常會等於起標價
    -- 後面有人出價時，這個欄位會更新
    current_price BIGINT NOT NULL CHECK (current_price >= 0),

    -- 最小加價幅度
    -- 例如目前 1000，最少每次加 100
    -- 預設是 1，且不能小於等於 0
    min_increment BIGINT NOT NULL DEFAULT 1 CHECK (min_increment > 0),

    -- 目前最高出價者是誰
    -- 還沒有人出價時可以是 NULL
    -- 對應 users(id)
    -- ON DELETE SET NULL 表示如果這個 user 被刪除，這裡就設成 NULL
    highest_bidder_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- 這筆拍賣目前的狀態
    -- 例如 active / ended / cancelled
    status VARCHAR(50) NOT NULL DEFAULT 'active',

    -- 拍賣開始時間
    -- 預設就是建立當下時間
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 拍賣結束時間
    -- 這個不能缺，建立拍賣時要明確給
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,

    -- 建立時間
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- 更新時間
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立索引：讓你之後查「某個 user 上架了哪些拍賣」更快
CREATE INDEX IF NOT EXISTS idx_auction_listings_seller_id
ON auction_listings(seller_id);

-- 建立索引：讓你之後查 active / ended / cancelled 更快
CREATE INDEX IF NOT EXISTS idx_auction_listings_status
ON auction_listings(status);

-- 建立索引：讓你之後查快到期、已到期的拍賣更快
CREATE INDEX IF NOT EXISTS idx_auction_listings_end_time
ON auction_listings(end_time);

-- 建立索引：讓你之後查「某個人目前領先哪些拍賣」更快
CREATE INDEX IF NOT EXISTS idx_auction_listings_highest_bidder_id
ON auction_listings(highest_bidder_id);