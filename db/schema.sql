CREATE TABLE IF NOT EXISTS income (
  id BIGSERIAL PRIMARY KEY,
  concept VARCHAR(120) NOT NULL,
  source VARCHAR(40) NOT NULL CHECK (source IN ('sueldo','comision','bonus','extra')),
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  occurred_on DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expense (
  id BIGSERIAL PRIMARY KEY,
  concept VARCHAR(120) NOT NULL,
  category VARCHAR(60) NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  occurred_on DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_income_occurred_on ON income(occurred_on);
CREATE INDEX IF NOT EXISTS idx_expense_occurred_on ON expense(occurred_on);
CREATE INDEX IF NOT EXISTS idx_expense_category ON expense(category);
