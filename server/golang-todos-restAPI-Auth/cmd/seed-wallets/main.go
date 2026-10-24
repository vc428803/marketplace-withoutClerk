package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"todo_api/internal/config"
	"todo_api/internal/database"

	"github.com/jackc/pgx/v5"
)

type seedAccount struct {
	Email  string
	Amount int64
	UserID string
}

func main() {
	// 防止不小心執行發幣指令。
	if os.Getenv("ENABLE_DEV_WALLET_SEED") != "1" {
		log.Fatal("僅限開發測試：請設定 ENABLE_DEV_WALLET_SEED=1")
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	pool, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	accounts := []seedAccount{
		{Email: "marketplace-test@example.com", Amount: 500},
		{Email: "nexelyth-register-test@example.com", Amount: 1000},
	}

	tx, err := pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		log.Fatal(err)
	}
	defer tx.Rollback(context.Background())

	// 同時執行兩份初始化程式時，讓它們依序處理。
	_, err = tx.Exec(ctx, "SELECT pg_advisory_xact_lock(20261025)")
	if err != nil {
		log.Fatal(err)
	}

	// 先確認所有測試帳號存在，避免初始化到一半才發現帳號缺失。
	for i := range accounts {
		err = tx.QueryRow(ctx,
			"SELECT id FROM users WHERE email = $1",
			accounts[i].Email,
		).Scan(&accounts[i].UserID)

		if err != nil {
			log.Fatalf("找不到測試帳號 %s: %v", accounts[i].Email, err)
		}
	}

	for _, account := range accounts {
		var walletID string
		var balance int64

		_, err = tx.Exec(ctx, `
			INSERT INTO wallets (user_id, currency_code, balance)
			VALUES ($1, 'G', 0)
			ON CONFLICT (user_id) DO NOTHING
		`, account.UserID)
		if err != nil {
			log.Fatal(err)
		}

		err = tx.QueryRow(ctx, `
			SELECT id, balance
			FROM wallets
			WHERE user_id = $1 AND currency_code = 'G'
			FOR UPDATE
		`, account.UserID).Scan(&walletID, &balance)
		if err != nil {
			log.Fatal(err)
		}

		var grantCount int
		err = tx.QueryRow(ctx, `
			SELECT COUNT(*)
			FROM wallet_transactions
			WHERE wallet_id = $1
			  AND transaction_type = 'INITIAL_GRANT'
		`, walletID).Scan(&grantCount)
		if err != nil {
			log.Fatal(err)
		}

		if grantCount > 0 {
			fmt.Printf("%s 已領取初始測試幣，略過\n", account.Email)
			continue
		}

		// 避免覆蓋已存在的其他資產。
		if balance != 0 {
			log.Fatalf("%s 錢包已有 %d G，停止初始化", account.Email, balance)
		}

		_, err = tx.Exec(ctx, `
			UPDATE wallets
			SET balance = $1, updated_at = NOW()
			WHERE id = $2
		`, account.Amount, walletID)
		if err != nil {
			log.Fatal(err)
		}

		_, err = tx.Exec(ctx, `
			INSERT INTO wallet_transactions (
				wallet_id,
				amount_delta,
				balance_after,
				transaction_type
			)
			VALUES ($1, $2, $2, 'INITIAL_GRANT')
		`, walletID, account.Amount)
		if err != nil {
			log.Fatal(err)
		}

		fmt.Printf("%s 準備初始化 %d G\n", account.Email, account.Amount)
	}

	if err = tx.Commit(ctx); err != nil {
		log.Fatal(err)
	}

	fmt.Println("Wallet 初始化交易已提交")
}
