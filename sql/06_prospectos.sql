-- ============================================================
--  06_prospectos.sql
--  Leads captados por el formulario público de la Landing.
--  Se aprueban / rechazan desde el panel del Super_Admin.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.prospectos_pendientes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_empresa      VARCHAR(200) NOT NULL,
  nombre_contacto     VARCHAR(150) NOT NULL,
  correo_corporativo  VARCHAR(150) NOT NULL,
  telefono            VARCHAR(20)  NOT NULL,
  interes             interes_prospecto NOT NULL DEFAULT 'Ambos',
  mensaje             TEXT,
  estatus             estatus_prospecto NOT NULL DEFAULT 'Nuevo',
  ip_origen           INET,
  user_agent          TEXT,
  utm_source          VARCHAR(100),
  utm_campaign        VARCHAR(100),
  reviewed_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at         TIMESTAMPTZ,
  notas_internas      TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prospectos_correo  ON public.prospectos_pendientes (LOWER(correo_corporativo));
CREATE INDEX IF NOT EXISTS idx_prospectos_estatus ON public.prospectos_pendientes (estatus);
CREATE INDEX IF NOT EXISTS idx_prospectos_interes ON public.prospectos_pendientes (interes);

ALTER TABLE public.prospectos_pendientes ENABLE ROW LEVEL SECURITY;