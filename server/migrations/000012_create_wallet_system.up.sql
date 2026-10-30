CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE
        REFERENCES users(id) ON DELETE RESTRICT,

    currency_code VARCHAR(10) NOT NULL DEFAULT 'G'
        CHECK (currency_code = 'G'),

    balance BIGINT NOT NULL DEFAULT 0
        CHECK (balance >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    wallet_id UUID NOT NULL
        REFERENCES wallets(id) ON DELETE RESTRICT,

    amount_delta BIGINT NOT NULL
        CHECK (amount_delta <> 0),

    balance_after BIGINT NOT NULL
        CHECK (balance_after >= 0),

    transaction_type VARCHAR(30) NOT NULL
        CHECK (
            transaction_type IN (
                'INITIAL_GRANT',
                'PURCHASE',
                'SALE',
                'REWARD',
                'ADJUSTMENT'
            )
        ),

    reference_id UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallet_transactions_wallet_created
ON wallet_transactions(wallet_id, created_at DESC);
