BEGIN;
ALTER TABLE debts ADD COLUMN IF NOT EXISTS installment_frequency VARCHAR(20) NOT NULL DEFAULT 'monthly';
ALTER TABLE debts ADD COLUMN IF NOT EXISTS total_installments INTEGER;
ALTER TABLE debts ADD COLUMN IF NOT EXISTS paid_installments INTEGER NOT NULL DEFAULT 0;
ALTER TABLE debts ADD COLUMN IF NOT EXISTS first_due_date DATE;
UPDATE debts SET first_due_date=COALESCE(first_due_date,due_date) WHERE first_due_date IS NULL;
CREATE TABLE IF NOT EXISTS debt_installments(
 id BIGSERIAL PRIMARY KEY,
 debt_id BIGINT NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
 installment_number INTEGER NOT NULL,
 due_date DATE NOT NULL,
 amount NUMERIC(14,2) NOT NULL CHECK(amount>0),
 status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK(status IN('pending','paid')),
 paid_on DATE,
 debt_payment_id BIGINT REFERENCES debt_payments(id) ON DELETE SET NULL,
 UNIQUE(debt_id,installment_number)
);
CREATE INDEX IF NOT EXISTS ix_debt_installments_due ON debt_installments(due_date,status);
COMMIT;