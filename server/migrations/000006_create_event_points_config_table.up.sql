-- 定義某活動的 points 區塊設定
CREATE TABLE IF NOT EXISTS event_points_config (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL,        -- points-reward-demo
    unit_label VARCHAR(50) NOT NULL,       -- 積分
    max_milestone INTEGER NOT NULL,        -- 150
    default_value INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id)                       -- 一個活動只有一筆設定
);

-- 定義某活動的 milestones 清單
CREATE TABLE IF NOT EXISTS event_milestones (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL,        -- points-reward-demo
    points INTEGER NOT NULL,               -- 150, 300, 450
    reward_id VARCHAR(100) NOT NULL,       -- reward_150, reward_300, reward_450
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, points)               -- 同一活動下，積分里程碑不重複
);

-- 參考前端呈現的效果
-- points: {
--     // 第一種，活動層級的設定，只有一筆
--     // 這些是整個活動共用的設定，所以放在 event_points_config (points.unitLabel / maxMilestone / defaultValue) ，一個活動對應一筆。
--     unitLabel: "積分",
--     maxMilestone: 150,
--     defaultValue: 0,
--     // 第二種，里程碑清單，有多筆
--     // 程碑是一對多的關係，一個活動有多個里程碑，所以不能塞在同一筆資料裡，要獨立成 event_milestones (points.milestones) 表。
--     milestones: [
--       {
--         points: 150,
--         rewardId: "reward_150",
--       },
--       {
--         points: 300,
--         rewardId: "reward_300",
--       },
--       {
--         points: 450,
--         rewardId: "reward_450",
--       },
--     ],
--   },