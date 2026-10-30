package repository

import (
	"context"
	"todo_api/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func GetEventPointsConfig(ctx context.Context, pool *pgxpool.Pool, eventID string) (*models.EventPointsConfig, error) {
	// 撈活動層級設定
	configQuery := `
		SELECT unit_label, max_milestone, default_value
		FROM event_points_config
		WHERE event_id = $1
	`
	var config models.EventPointsConfig
	err := pool.QueryRow(ctx, configQuery, eventID).Scan(
		&config.UnitLabel,
		&config.MaxMilestone,
		&config.DefaultValue,
	)
	if err != nil {
		return nil, err
	}

	// 撈里程碑清單
	milestonesQuery := `
		SELECT points, reward_id
		FROM event_milestones
		WHERE event_id = $1
		ORDER BY points ASC
	`
	rows, err := pool.Query(ctx, milestonesQuery, eventID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var milestone models.EventMilestone
		err := rows.Scan(&milestone.Points, &milestone.RewardID)
		if err != nil {
			return nil, err
		}
		config.Milestones = append(config.Milestones, milestone)
	}

	return &config, nil
}
