BEGIN;
ALTER TABLE debt_payments ADD COLUMN IF NOT EXISTS expense_id BIGINT REFERENCES expense(id) ON DELETE SET NULL;
ALTER TABLE debt_payments ADD COLUMN IF NOT EXISTS account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL;
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS last_payment_date DATE;
CREATE INDEX IF NOT EXISTS ix_debt_payments_expense ON debt_payments(expense_id);
CREATE INDEX IF NOT EXISTS ix_debt_payments_account ON debt_payments(account_id);
COMMIT;