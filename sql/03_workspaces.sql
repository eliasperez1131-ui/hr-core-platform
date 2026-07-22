-- ============================================================
--  03_workspaces.sql
--  Cuentas corporativas (clientes SaaS). Una empresa puede tener
--  N usuarios con distintos roles.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.workspaces_empresas (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_empresa     VARCHAR(200) NOT NULL,
  giro_industrial    giro_industrial NOT NULL DEFAULT 'Otro',
  plan_activo        plan_suscripcion NOT NULL DEFAULT 'Trial',
  rfc                VARCHAR(20),
  sitio_web          TEXT,
  telefono_contacto  VARCHAR(20),
  direccion_fiscal   TEXT,
  logo_url           TEXT,
  max_usuarios       INT DEFAULT 10,
  activo             BOOLEAN NOT NULL DEFAULT true,
  fecha_alta         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_giro  ON public.workspaces_empresas(giro_industrial);
CREATE INDEX IF NOT EXISTS idx_workspaces_plan  ON public.workspaces_empresas(plan_activo);

ALTER TABLE public.workspaces_empresas ENABLE ROW LEVEL SECURITY;

-- FK desde user_profiles hacia workspaces (agregada ahora para evitar dependencia circular)
DO $$ BEGIN
  ALTER TABLE public.user_profiles
    ADD CONSTRAINT user_profiles_workspace_fk
    FOREIGN KEY (workspace_id) REFERENCES public.workspaces_empresas(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;