-- 定義某活動下 reward 的詳細內容，包括圖片
CREATE TABLE IF NOT EXISTS rewards (
    id BIGSERIAL PRIMARY KEY,
    reward_id VARCHAR(100) NOT NULL,           -- reward_150
    event_id VARCHAR(100) NOT NULL,            -- points-reward-demo
    milestone_points INTEGER NOT NULL,         -- 150
    title VARCHAR(255) NOT NULL,               -- 150積分獎勵
    preview_image_url VARCHAR(500),            -- https://...
    preview_description VARCHAR(255),          -- 神秘寶箱 x1
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(reward_id, event_id)
);