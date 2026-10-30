/*
這一步要做什麼 ? 把一整包 event 資料一次寫入多張 table，並且使用 transaction (Begin + Rollback)。
transaction概念: 把好幾個 SQL 動作綁成同一包，要嘛全部成功，要嘛全部失敗。

流程:
成功新增 events
成功新增 event_points_config
成功新增兩筆 event_milestones
新增 rewards 時第 3 筆失敗
程式中斷
*/

package repository

import (
	"context"
	"todo_api/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func CreateEventWithDetails(
	ctx context.Context,
	pool *pgxpool.Pool,
	req models.CreateEventRequest,
) error {
	tx, err := pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	eventQuery := `
		INSERT INTO events (
			event_id,
			title,
			description,
			is_active,
			created_at,
			updated_at
		)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
	`
	_, err = tx.Exec(
		ctx,
		eventQuery,
		req.Event.EventID,
		req.Event.Title,
		req.Event.Description,
		req.Event.IsActive,
	)
	if err != nil {
		return err
	}

	pointsConfigQuery := `
		INSERT INTO event_points_config (
			event_id,
			unit_label,
			max_milestone,
			default_value,
			created_at,
			updated_at
		)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
	`
	_, err = tx.Exec(
		ctx,
		pointsConfigQuery,
		req.Event.EventID,
		req.PointsConfig.UnitLabel,
		req.PointsConfig.MaxMilestone,
		req.PointsConfig.DefaultValue,
	)
	if err != nil {
		return err
	}

	milestoneQuery := `
		INSERT INTO event_milestones (
			event_id,
			points,
			reward_id,
			created_at
		)
		VALUES ($1, $2, $3, NOW())
	`
	for _, milestone := range req.Milestones {
		_, err = tx.Exec(
			ctx,
			milestoneQuery,
			req.Event.EventID,
			milestone.Points,
			milestone.RewardID,
		)
		if err != nil {
			return err
		}
	}

	rewardQuery := `
		INSERT INTO rewards (
			reward_id,
			event_id,
			milestone_points,
			title,
			preview_image_url,
			preview_description,
			created_at,
			updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
	`
	for _, reward := range req.Rewards {
		_, err = tx.Exec(
			ctx,
			rewardQuery,
			reward.RewardID,
			req.Event.EventID,
			reward.MilestonePoints,
			reward.Title,
			reward.Preview.ImageURL,
			reward.Preview.Description,
		)
		if err != nil {
			return err
		}
	}

	taskQuery := `
		INSERT INTO tasks (
			task_id,
			event_id,
			title,
			description,
			badge_text,
			points_reward,
			action_url,
			max_completion_count,
			created_at,
			updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
	`
	for _, task := range req.Tasks {
		_, err = tx.Exec(
			ctx,
			taskQuery,
			task.TaskID,
			req.Event.EventID,
			task.Title,
			task.Description,
			task.BadgeText,
			task.PointsReward,
			task.ActionURL,
			task.MaxCompletionCount,
		)
		if err != nil {
			return err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return err
	}

	return nil
}
