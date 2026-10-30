-- 某位使用者對應的任務情況，包含完成次數、是否達標、是否領取積分，所以需要知道是哪一個活動(event_id)，也需要知道是哪一個任務(task_id)
CREATE TABLE user_task_progress (
    id BIGSERIAL PRIMARY KEY,
    -- 🔴 關鍵調整：UUID 類型，與 users.id 完全一致
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- 任務關聯 (保持與 tasks 表一致)
    task_id VARCHAR(100) NOT NULL,   -- task_bind_phone 
    event_id VARCHAR(100) NOT NULL,  -- points-reward-demo
    -- 對應 Mock 的 status 欄位
    current_count INTEGER DEFAULT 0,   -- 當前完成次數
    is_completed BOOLEAN DEFAULT FALSE,-- 是否達標
    is_claimed BOOLEAN DEFAULT FALSE,  -- 積分是否已領取 (防重複領)
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- 🔴 業務約束：確保每個用戶對「同一個活動的同一個任務」只有一筆進度
    UNIQUE(user_id, task_id, event_id)

);
-- 「查小明在 points-reward-demo 這個活動裡，所有任務的進度」
-- 沒有這個 index ，PostgreSQL 會全表掃描。有了之後直接走索引定位，資料量大的時候差很多。
CREATE INDEX idx_user_event_progress ON user_task_progress (user_id, event_id);
