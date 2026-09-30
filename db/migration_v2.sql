-- Gestor de gastos v2
ALTER TABLE income ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pagado' CHECK (status IN ('pagado','pendiente'));
ALTER TABLE expense ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pagado' CHECK (status IN ('pagado','pendiente'));
ALTER TABLE income ADD COLUMN IF NOT EXISTS recurring_id BIGINT;
ALTER TABLE expense ADD COLUMN IF NOT EXISTS recurring_id BIGINT;
ALTER TABLE income ADD COLUMN IF NOT EXISTS period_key VARCHAR(7);
ALTER TABLE expense ADD COLUMN IF NOT EXISTS period_key VARCHAR(7);

CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(60) UNIQUE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

INSERT INTO categories(name,sort_order) VALUES
('Alimentación',1),('Vivienda',2),('Servicios',3),('Transporte',4),('Salud',5),('Ocio',6),
('Compras',7),('Deudas',8),('Suscripciones',9),('Educación',10),('Otros',11)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS budgets (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  UNIQUE(category_id,year,month)
);

CREATE TABLE IF NOT EXISTS recurring_items (
  id BIGSERIAL PRIMARY KEY,
  kind VARCHAR(10) NOT NULL CHECK (kind IN ('income','expense')),
  concept VARCHAR(120) NOT NULL,
  category VARCHAR(60),
  source VARCHAR(40),
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  day_of_month INTEGER NOT NULL DEFAULT 1 CHECK (day_of_month BETWEEN 1 AND 28),
  status VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pagado','pendiente')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS savings_goals (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  target_amount NUMERIC(14,2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_income_recurring_period ON income(recurring_id,period_key) WHERE recurring_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_expense_recurring_period ON expense(recurring_id,period_key) WHERE recurring_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO knj_gastos_gastos_usr;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO knj_gastos_gastos_usr;
