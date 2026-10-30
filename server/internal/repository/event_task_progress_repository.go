package repository

import (
	"context"
	"todo_api/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func UpdateEventTaskProgress(
	ctx context.Context,
	pool *pgxpool.Pool,
	userID string,
	eventID string,
	taskID string,
	req models.UpdateTaskProgressRequest,
) (*models.TaskWithStatus, error) {
	// 1. 先確認這個 task 確實存在，而且屬於這個 event
	var task models.TaskWithStatus

	// 查詢的這三個欄位的值，下一步 抄進 task 這個 struct 裡
	/*
		task_id       = task_bind_phone
		title         = 綁定手機門號
		points_reward = 200
	*/
	checkTaskQuery := `
		SELECT task_id, title, points_reward
		FROM tasks
		WHERE event_id = $1 AND task_id = $2
	`

	// 把查到的欄位值，塞進 task 這個 struct 裡
	/*
		models.TaskWithStatus{
			TaskID: "task_bind_phone",
			Title:  "綁定手機門號",
			Points: 200,
			Status: models.TaskStatus{},
		}
	*/
	err := pool.QueryRow(ctx, checkTaskQuery, eventID, taskID).Scan(
		&task.TaskID,
		&task.Title,
		&task.Points, // 把 task.Points 這個欄位的位址交給 Scan，讓它可以直接把資料寫進去
	)

	if err != nil {
		return nil, err
	}
	/*
		1. INSERT INTO user_task_progress : 我要往 user_task_progress 這張表新增一筆資料，並且要寫入這些欄位。
		2. pool.QueryRow( : 我要從 user_task_progress 這張表撈出一筆資料這些欄位要塞甚麼值進去
		3. 第七個欄位 => CASE WHEN $5 = true THEN NOW() ELSE NULL END : 如果 $5 等於 true 就把現在的時間塞進去，否則就是 null
		4. ON CONFLICT => ON CONFLICT (user_id, task_id, event_id) DO UPDATE SET => 之前已經有值，現在直接更新
	*/
	// 2. 寫入或更新這個 user 在此 event/task 的 progress
	upsertQuery := `
		INSERT INTO user_task_progress (
			user_id, 
			task_id,
			event_id,
			current_count,
			is_completed,
			is_claimed,
			completed_at,
			updated_at
		)
		VALUES (
			$1, $2, $3, $4, $5, $6,
			CASE WHEN $5 = true THEN NOW() ELSE NULL END,
			NOW()
		)
		ON CONFLICT (user_id, task_id, event_id)
		DO UPDATE SET
			current_count = EXCLUDED.current_count,
			is_completed = EXCLUDED.is_completed,
			is_claimed = EXCLUDED.is_claimed,
			completed_at = CASE
				WHEN EXCLUDED.is_completed = true
					AND user_task_progress.completed_at IS NULL
				THEN NOW()
				WHEN EXCLUDED.is_completed = false
				THEN NULL
				ELSE user_task_progress.completed_at
			END,
			updated_at = NOW()
		RETURNING current_count, is_completed, is_claimed
	`

	err = pool.QueryRow(
		ctx,
		upsertQuery,
		userID,  // $1
		taskID,  // $2
		eventID, // $3
		// 前端傳的body request
		req.CurrentCount, // $4
		req.IsCompleted,  // $5
		req.IsClaimed,    // $6
	).Scan(
		// 執行 upsertQuery 這段 SQL，把資料寫進資料庫，然後把 SQL RETURNING 回來的結果，塞進 task.Status 裡。
		// SQL RETURNING 回來的結果，塞進 task.Status 裡。
		&task.Status.CurrentCount,
		&task.Status.IsCompleted,
		&task.Status.IsClaimed,
	)
	if err != nil {
		return nil, err
	}

	return &task, nil
}
