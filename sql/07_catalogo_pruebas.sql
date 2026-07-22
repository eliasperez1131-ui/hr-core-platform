-- ============================================================
--  07_catalogo_pruebas.sql
--  Catálogo de pruebas psicométricas disponibles.
--  Es público en lectura (para la landing) y solo Super_Admin
--  lo gestiona.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.catalogo_pruebas (
  id                       SERIAL PRIMARY KEY,
  codigo                   VARCHAR(30) NOT NULL UNIQUE,
  categoria                prueba_categoria NOT NULL,
  nombre                   VARCHAR(150) NOT NULL,
  descripcion_corta        VARCHAR(250),
  descripcion_larga        TEXT,
  duracion_estimada_min    INT,
  confiabilidad_pct        NUMERIC(5,2),
  activo                   BOOLEAN NOT NULL DEFAULT true,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_catalogo_categoria ON public.catalogo_pruebas (categoria);
CREATE INDEX IF NOT EXISTS idx_catalogo_activo    ON public.catalogo_pruebas (activo);

ALTER TABLE public.catalogo_pruebas ENABLE ROW LEVEL SECURITY;