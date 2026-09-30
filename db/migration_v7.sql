BEGIN;
CREATE TABLE IF NOT EXISTS app_users(
 id BIGSERIAL PRIMARY KEY,
 email VARCHAR(180) UNIQUE NOT NULL,
 whatsapp VARCHAR(40) NOT NULL,
 password_hash TEXT,
 role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK(role IN('admin','user')),
 active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 last_login_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS user_sessions(
 id UUID PRIMARY KEY,
 user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 expires_at TIMESTAMPTZ NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS audit_log(
 id BIGSERIAL PRIMARY KEY,
 user_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
 action VARCHAR(80) NOT NULL,
 entity VARCHAR(80),
 entity_id BIGINT,
 details JSONB NOT NULL DEFAULT '{}'::jsonb,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO app_users(email,whatsapp,role,active)
VALUES('jorgitom18@gmail.com','PENDIENTE','admin',true)
ON CONFLICT(email) DO UPDATE SET role='admin',active=true;

DO $$ DECLARE admin_id BIGINT; BEGIN
 SELECT id INTO admin_id FROM app_users WHERE email='jorgitom18@gmail.com';
 ALTER TABLE income ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES app_users(id);
 ALTER TABLE expense ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES app_users(id);
 ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES app_users(id);
 ALTER TABLE budgets ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES app_users(id);
 ALTER TABLE recurring_items ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES app_users(id);
 ALTER TABLE savings_goals ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES app_users(id);
 ALTER TABLE monthly_budgets ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES app_users(id);
 ALTER TABLE accounts ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES app_users(id);
 ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES app_users(id);
 ALTER TABLE transfers ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES app_users(id);
 ALTER TABLE debts ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES app_users(id);
 ALTER TABLE tags ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES app_users(id);
 ALTER TABLE receipts ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES app_users(id);
 ALTER TABLE monthly_closures ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES app_users(id);
 UPDATE income SET user_id=admin_id WHERE user_id IS NULL;
 UPDATE expense SET user_id=admin_id WHERE user_id IS NULL;
 UPDATE categories SET user_id=admin_id WHERE user_id IS NULL;
 UPDATE budgets SET user_id=admin_id WHERE user_id IS NULL;
 UPDATE recurring_items SET user_id=admin_id WHERE user_id IS NULL;
 UPDATE savings_goals SET user_id=admin_id WHERE user_id IS NULL;
 UPDATE monthly_budgets SET user_id=admin_id WHERE user_id IS NULL;
 UPDATE accounts SET user_id=admin_id WHERE user_id IS NULL;
 UPDATE credit_cards SET user_id=admin_id WHERE user_id IS NULL;
 UPDATE transfers SET user_id=admin_id WHERE user_id IS NULL;
 UPDATE debts SET user_id=admin_id WHERE user_id IS NULL;
 UPDATE tags SET user_id=admin_id WHERE user_id IS NULL;
 UPDATE receipts SET user_id=admin_id WHERE user_id IS NULL;
 UPDATE monthly_closures SET user_id=admin_id WHERE user_id IS NULL;
END $$;
CREATE INDEX IF NOT EXISTS ix_income_user ON income(user_id);
CREATE INDEX IF NOT EXISTS ix_expense_user ON expense(user_id);
CREATE INDEX IF NOT EXISTS ix_accounts_user ON accounts(user_id);
CREATE INDEX IF NOT EXISTS ix_cards_user ON credit_cards(user_id);
CREATE INDEX IF NOT EXISTS ix_debts_user ON debts(user_id);
CREATE INDEX IF NOT EXISTS ix_audit_user ON audit_log(user_id,created_at DESC);
COMMIT;