-- 特定活動，旗下對應的所有任務，所以未來擴充某個活動底下的任務時，直接在這加入任務即可
CREATE TABLE IF NOT EXISTS tasks (
    task_id VARCHAR(100) PRIMARY KEY,           -- task_daily_login、task_bind_phone，API 直接傳 task_id，除錯容易，也符合 DDD (領域驅動設計) 思維
    event_id VARCHAR(100) NOT NULL,             -- 所屬活動 : points-reward-demo (會有多種活動)
    title VARCHAR(255) NOT NULL,                -- 任務標題 : 綁定手機門號
    description TEXT,                           -- 任務說明: 可選，用於顯示更詳細的規則或提示
    badge_text VARCHAR(50),                     -- 角標文字: 如「特別任務」、「限時」，用於前端視覺強調。
    points_reward INTEGER NOT NULL DEFAULT 0,   -- 獎勵分數: 綁定手機得 200 分，是全局共享
    action_url VARCHAR(500),                    -- 跳轉連結: "/account/bind-phone"，可以定義站內路由、站外路由，可以避免前端寫死
    max_completion_count INTEGER DEFAULT 1,     -- 最大完成次數
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, event_id)          -- 確保同一活動下任務不重複
);