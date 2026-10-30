// 建立「後台新增 event」會用到的 request structs。
package models

type CreateEventRequest struct {
	Event        EventBaseRequest         `json:"event"`
	PointsConfig EventPointsConfigRequest `json:"pointsConfig"`
	Milestones   []EventMilestoneRequest  `json:"milestones"`
	Rewards      []RewardRequest          `json:"rewards"`
	Tasks        []TaskCreateRequest      `json:"tasks"`
}

type EventBaseRequest struct {
	EventID     string `json:"eventId"`
	Title       string `json:"title"`
	Description string `json:"description"`
	IsActive    bool   `json:"isActive"`
}

type EventPointsConfigRequest struct {
	UnitLabel    string `json:"unitLabel"`
	MaxMilestone int    `json:"maxMilestone"`
	DefaultValue int    `json:"defaultValue"`
}

type EventMilestoneRequest struct {
	Points   int    `json:"points"`
	RewardID string `json:"rewardId"`
}

type RewardRequest struct {
	RewardID        string        `json:"rewardId"`
	MilestonePoints int           `json:"milestonePoints"`
	Title           string        `json:"title"`
	Preview         RewardPreview `json:"preview"`
}

type TaskCreateRequest struct {
	TaskID             string `json:"taskId"`
	Title              string `json:"title"`
	Description        string `json:"description"`
	BadgeText          string `json:"badgeText"`
	PointsReward       int    `json:"pointsReward"`
	ActionURL          string `json:"actionUrl"`
	MaxCompletionCount int    `json:"maxCompletionCount"`
}
