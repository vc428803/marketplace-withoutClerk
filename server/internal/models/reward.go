package models

type RewardPreview struct {
	ImageURL    string `json:"imageUrl"`
	Description string `json:"description"`
}

type Reward struct {
	RewardID        string        `json:"rewardId"`
	MilestonePoints int           `json:"milestonePoints"`
	Title           string        `json:"title"`
	Preview         RewardPreview `json:"preview"`
}
