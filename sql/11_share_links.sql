-- ============================================================
--  11_share_links.sql
--  Tabla para los "Magic Links" — URLs únicas de solo lectura
--  que el Admin/Reclutador comparte con el cliente externo
--  para mostrar finalistas de una vacante sin necesidad de
--  crear una cuenta.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.share_links (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token              VARCHAR(64) NOT NULL UNIQUE,
  vacante_id         UUID NOT NULL REFERENCES public.vacantes(id) ON DELETE CASCADE,
  created_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  label              VARCHAR(100),
  expires_at         TIMESTAMPTZ,
  revoked_at         TIMESTAMPTZ,
  access_count       INT NOT NULL DEFAULT 0,
  last_accessed_at   TIMESTAMPTZ,
  metadata           JSONB DEFAULT '{}'::jsonb,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_share_links_token    ON public.share_links (token);
CREATE INDEX IF NOT EXISTS idx_share_links_vacante  ON public.share_links (vacante_id);
CREATE INDEX IF NOT EXISTS idx_share_links_created  ON public.share_links (created_at DESC);

ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;

-- Trigger de updated_at (re-usa la función set_updated_at del script 09)
DROP TRIGGER IF EXISTS trg_share_links_set_updated_at ON public.share_links;
CREATE TRIGGER trg_share_links_set_updated_at
  BEFORE UPDATE ON public.share_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
--  RLS
--  - Solo Super_Admin / Administrador_Agencia / Coordinador
--    pueden crear / listar / revocar enlaces.
--  - La vista pública /compartir/[token] NO accede a la tabla
--    directamente: la API valida el token con service_role
--    para bypassear RLS de forma controlada.
-- ============================================================

CREATE POLICY "admin_coordinador_manage_share_links" ON public.share_links
  FOR ALL TO authenticated
  USING (
    public.is_super_admin()
    OR public.get_user_role() IN ('Administrador_Agencia', 'Coordinador')
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.get_user_role() IN ('Administrador_Agencia', 'Coordinador')
  );

-- ============================================================
--  Columna auxiliar en vacante_candidatos para marcar los
--  finalistas que SÍ deben verse en el portal público.
--  (Esto es lo que el Coordinador activa al aprobar.)
-- ============================================================

DO $$ BEGIN
  ALTER TABLE public.vacante_candidatos
    ADD COLUMN IF NOT EXISTS visible_cliente BOOLEAN NOT NULL DEFAULT false;
EXCEPTION WHEN others THEN NULL; END $$;