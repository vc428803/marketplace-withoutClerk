package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Wallet struct {
	Currency string `json:"currency"`
	Balance  int64  `json:"balance"`
}

func GetWalletByUserID(
	ctx context.Context,
	pool *pgxpool.Pool,
	userID string,
) (Wallet, error) {
	var wallet Wallet

	err := pool.QueryRow(ctx, `
		SELECT currency_code, balance
		FROM wallets
		WHERE user_id = $1
	`, userID).Scan(&wallet.Currency, &wallet.Balance)

	return wallet, err
}
