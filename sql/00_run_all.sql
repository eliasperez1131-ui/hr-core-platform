-- ============================================================
--  HR CORE — Script Maestro (00_run_all.sql)
--  Ejecutar en el SQL Editor de Supabase en ORDEN.
--  Recomendado: copiar y pegar bloque por bloque.
-- ============================================================

-- 1) Enums y tipos
\i sql/01_enums.sql

-- 2) Tabla de perfiles (extiende auth.users)
\i sql/02_user_profiles.sql

-- 3) Workspaces / Empresas
\i sql/03_workspaces.sql

-- 4) Candidatos
\i sql/04_candidatos.sql

-- 5) Vacantes (con vistas que separan info financiera)
\i sql/05_vacantes.sql

-- 6) Prospectos (leads landing)
\i sql/06_prospectos.sql

-- 7) Catálogo de pruebas psicométricas
\i sql/07_catalogo_pruebas.sql

-- 8) Políticas RLS (lo más importante)
\i sql/08_rls_policies.sql

-- 9) Triggers (updated_at automático)
\i sql/09_triggers.sql

-- 10) Seed del catálogo de pruebas
\i sql/10_seed_catalogo.sql

-- ============================================================
--  NOTA: Si ejecutas desde psql usa \i. Desde el SQL Editor de
--  Supabase, copia el contenido de cada archivo en orden.
-- ============================================================