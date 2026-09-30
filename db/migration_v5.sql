BEGIN;

CREATE TABLE IF NOT EXISTS accounts(
 id BIGSERIAL PRIMARY KEY,
 name VARCHAR(80) UNIQUE NOT NULL,
 kind VARCHAR(20) NOT NULL DEFAULT 'bank' CHECK(kind IN('cash','bank','debit','other')),
 opening_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
 active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO accounts(name,kind) VALUES ('Efectivo','cash') ON CONFLICT(name) DO NOTHING;

CREATE TABLE IF NOT EXISTS credit_cards(
 id BIGSERIAL PRIMARY KEY,
 name VARCHAR(80) UNIQUE NOT NULL,
 closing_day INTEGER NOT NULL CHECK(closing_day BETWEEN 1 AND 31),
 due_day INTEGER NOT NULL CHECK(due_day BETWEEN 1 AND 31),
 account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
 active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS transfers(
 id BIGSERIAL PRIMARY KEY,
 from_account_id BIGINT NOT NULL REFERENCES accounts(id),
 to_account_id BIGINT NOT NULL REFERENCES accounts(id),
 amount NUMERIC(14,2) NOT NULL CHECK(amount>0),
 occurred_on DATE NOT NULL,
 notes VARCHAR(240),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK(from_account_id<>to_account_id)
);
CREATE TABLE IF NOT EXISTS debts(
 id BIGSERIAL PRIMARY KEY,
 name VARCHAR(120) NOT NULL,
 lender VARCHAR(120),
 original_amount NUMERIC(14,2) NOT NULL CHECK(original_amount>0),
 current_balance NUMERIC(14,2) NOT NULL CHECK(current_balance>=0),
 installment_amount NUMERIC(14,2),
 due_date DATE,
 status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK(status IN('active','paid')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS debt_payments(
 id BIGSERIAL PRIMARY KEY,
 debt_id BIGINT NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
 amount NUMERIC(14,2) NOT NULL CHECK(amount>0),
 paid_on DATE NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS tags(id BIGSERIAL PRIMARY KEY,name VARCHAR(50) UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS movement_tags(
 movement_kind VARCHAR(10) NOT NULL CHECK(movement_kind IN('income','expense')),
 movement_id BIGINT NOT NULL,
 tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
 PRIMARY KEY(movement_kind,movement_id,tag_id)
);
CREATE TABLE IF NOT EXISTS receipts(
 id BIGSERIAL PRIMARY KEY,
 movement_kind VARCHAR(10) NOT NULL CHECK(movement_kind IN('income','expense')),
 movement_id BIGINT NOT NULL,
 file_name VARCHAR(180) NOT NULL,
 mime_type VARCHAR(100) NOT NULL,
 data BYTEA NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS monthly_closures(
 year INTEGER NOT NULL,
 month INTEGER NOT NULL CHECK(month BETWEEN 1 AND 12),
 income NUMERIC(14,2) NOT NULL,
 expense NUMERIC(14,2) NOT NULL,
 balance NUMERIC(14,2) NOT NULL,
 snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
 closed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 PRIMARY KEY(year,month)
);
ALTER TABLE income ADD COLUMN IF NOT EXISTS account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL;
ALTER TABLE expense ADD COLUMN IF NOT EXISTS account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL;
ALTER TABLE expense ADD COLUMN IF NOT EXISTS credit_card_id BIGINT REFERENCES credit_cards(id) ON DELETE SET NULL;
ALTER TABLE expense ADD COLUMN IF NOT EXISTS installment_group UUID;
ALTER TABLE expense ADD COLUMN IF NOT EXISTS installment_number INTEGER;
ALTER TABLE expense ADD COLUMN IF NOT EXISTS installment_total INTEGER;
CREATE INDEX IF NOT EXISTS ix_income_account ON income(account_id);
CREATE INDEX IF NOT EXISTS ix_expense_account ON expense(account_id);
CREATE INDEX IF NOT EXISTS ix_expense_card ON expense(credit_card_id);
CREATE INDEX IF NOT EXISTS ix_expense_installment ON expense(installment_group);
DO $ BEGIN
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='knj_gastos_gastos_usr') THEN
  GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO knj_gastos_gastos_usr;
  GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA public TO knj_gastos_gastos_usr;
 END IF;
END $;
COMMIT;