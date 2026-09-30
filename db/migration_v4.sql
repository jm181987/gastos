BEGIN;

-- La tabla expense originalmente limitaba category a una lista fija.
-- Ahora las categorías son configurables, por lo que ese CHECK ya no debe existir.
DO $$
DECLARE
  constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'expense'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%category%'
  LOOP
    EXECUTE format('ALTER TABLE public.expense DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;

COMMIT;
