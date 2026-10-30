package models

/*
是任務進度資料
比較偏 task progress / user progress
*/
type UpdateTaskProgressRequest struct {
	CurrentCount int  `json:"currentCount"`
	IsCompleted  bool `json:"isCompleted"`
	IsClaimed    bool `json:"isClaimed"`
}

type TaskStatus struct {
	IsCompleted  bool `json:"isCompleted"`
	CurrentCount int  `json:"currentCount"`
	IsClaimed    bool `json:"isClaimed"`
}

type TaskWithStatus struct {
	TaskID string     `json:"taskId"`
	Title  string     `json:"title"`
	Points int        `json:"points"`
	Status TaskStatus `json:"status"`
}
