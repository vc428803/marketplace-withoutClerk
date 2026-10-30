package repository

import (
	"context"
	"todo_api/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func GetEventRewards(ctx context.Context, pool *pgxpool.Pool, eventID string) ([]models.Reward, error) {
	query := `
		SELECT reward_id, milestone_points, title, preview_image_url, preview_description
		FROM rewards
		WHERE event_id = $1
		ORDER BY milestone_points ASC
	`

	rows, err := pool.Query(ctx, query, eventID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rewards []models.Reward
	for rows.Next() {
		var reward models.Reward
		err := rows.Scan(
			&reward.RewardID,
			&reward.MilestonePoints,
			&reward.Title,
			&reward.Preview.ImageURL,
			&reward.Preview.Description,
		)
		if err != nil {
			return nil, err
		}
		rewards = append(rewards, reward)
	}

	return rewards, nil
}
