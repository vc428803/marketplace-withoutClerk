package models

/*
是活動設定資料
比較偏 event 的靜態配置
*/
type EventMilestone struct {
	Points   int    `json:"points"`
	RewardID string `json:"rewardId"`
}

type EventPointsConfig struct {
	UnitLabel    string           `json:"unitLabel"`
	MaxMilestone int              `json:"maxMilestone"`
	DefaultValue int              `json:"defaultValue"`
	Milestones   []EventMilestone `json:"milestones"`
}
