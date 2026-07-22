-- ============================================================
--  09_triggers.sql
--  Trigger genérico para mantener updated_at al día.
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'user_profiles',
      'workspaces_empresas',
      'candidatos',
      'vacantes',
      'vacante_candidatos',
      'prospectos_pendientes'
    ])
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_%I_set_updated_at ON public.%I;
      CREATE TRIGGER trg_%I_set_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    ', t, t, t, t);
  END LOOP;
END $$;