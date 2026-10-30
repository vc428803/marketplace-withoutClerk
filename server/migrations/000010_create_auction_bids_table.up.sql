-- 建立出價紀錄表
-- 這張表存的是「每一次出價的歷史紀錄」
-- 例如：
-- B 出 12000
-- C 出 15000
-- B 又出 18000 這些都會各自是一筆 auction_bids。
-- 所以它是在記錄競拍過程，不是記錄最終狀態。

CREATE TABLE IF NOT EXISTS auction_bids (
    -- 每一筆出價自己的唯一 id
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 這筆出價是對哪一個拍賣商品出的
    -- 對應 auction_listings(id)
    -- ON DELETE CASCADE 表示如果 listing 被刪除，相關出價也一起刪除
    listing_id UUID NOT NULL REFERENCES auction_listings(id) ON DELETE CASCADE,

    -- 這筆出價是哪個 user 出的
    -- 對應 users(id)
    -- ON DELETE CASCADE 表示如果 user 被刪除，他的出價紀錄也一起刪除
    bidder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- 這次出的價格
    -- 必須大於 0
    bid_amount BIGINT NOT NULL CHECK (bid_amount > 0),

    -- 出價時間
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立索引：讓你查某個拍賣的所有出價紀錄更快
CREATE INDEX IF NOT EXISTS idx_auction_bids_listing_id
ON auction_bids(listing_id);

-- 建立索引：讓你查某個 user 出過哪些價更快
CREATE INDEX IF NOT EXISTS idx_auction_bids_bidder_id
ON auction_bids(bidder_id);

-- 建立複合索引：讓你查某個 listing 的出價歷史，並依最新時間排序更快
CREATE INDEX IF NOT EXISTS idx_auction_bids_listing_id_created_at
ON auction_bids(listing_id, created_at DESC);