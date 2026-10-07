BEGIN;

CREATE TABLE IF NOT EXISTS card_payments(
 id BIGSERIAL PRIMARY KEY,
 credit_card_id BIGINT NOT NULL REFERENCES credit_cards(id) ON DELETE CASCADE,
 account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
 year INTEGER NOT NULL,
 month INTEGER NOT NULL CHECK(month BETWEEN 1 AND 12),
 amount NUMERIC(14,2) NOT NULL CHECK(amount>0),
 paid_on DATE NOT NULL,
 user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(user_id,credit_card_id,year,month)
);
CREATE INDEX IF NOT EXISTS ix_card_payments_user_period ON card_payments(user_id,year,month);
CREATE INDEX IF NOT EXISTS ix_card_payments_account ON card_payments(account_id);

COMMIT;
