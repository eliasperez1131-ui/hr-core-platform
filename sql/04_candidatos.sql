-- ============================================================
--  04_candidatos.sql
--  CRM de talento. Correo y teléfono son UNIQUE para servir
--  como llaves de validación cruzada (deduplicación).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.candidatos (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo          VARCHAR(200) NOT NULL,
  correo                   VARCHAR(150) NOT NULL UNIQUE,
  telefono                 VARCHAR(20)  NOT NULL UNIQUE,
  edad                     INT CHECK (edad IS NULL OR (edad >= 14 AND edad <= 100)),
  escolaridad              VARCHAR(100),
  estado                   VARCHAR(50),
  municipio                VARCHAR(100),
  url_cv_pdf               TEXT,
  consentimiento_red       BOOLEAN NOT NULL DEFAULT false,
  vacantes_participadas    INT NOT NULL DEFAULT 0,
  inasistencias            INT NOT NULL DEFAULT 0,
  abandonos                INT NOT NULL DEFAULT 0,
  workspace_id             UUID REFERENCES public.workspaces_empresas(id) ON DELETE SET NULL,
  tags                     TEXT[] DEFAULT '{}',
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidatos_correo_lower   ON public.candidatos (LOWER(correo));
CREATE INDEX IF NOT EXISTS idx_candidatos_telefono       ON public.candidatos (telefono);
CREATE INDEX IF NOT EXISTS idx_candidatos_workspace      ON public.candidatos (workspace_id);
CREATE INDEX IF NOT EXISTS idx_candidatos_estado_municipio ON public.candidatos (estado, municipio);

ALTER TABLE public.candidatos ENABLE ROW LEVEL SECURITY;