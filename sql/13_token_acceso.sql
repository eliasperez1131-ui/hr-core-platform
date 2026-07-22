-- ============================================================
--  13_token_acceso.sql
--  Agrega la columna `token_acceso` a la tabla `candidatos`
--  para que el candidato pueda ingresar a su evaluación con
--  un código alfanumérico de 6-8 caracteres.
-- ============================================================

ALTER TABLE public.candidatos
  ADD COLUMN IF NOT EXISTS token_acceso VARCHAR(8) UNIQUE;

-- Índice para acelerar la búsqueda durante el login
CREATE INDEX IF NOT EXISTS idx_candidatos_token ON public.candidatos (token_acceso);

-- Comentario de la columna
COMMENT ON COLUMN public.candidatos.token_acceso IS
  'Token alfanumérico de 6-8 chars (MAYÚSCULAS sin ambiguos: 0/O/1/I/L) para que el candidato acceda a su evaluación.';

-- ============================================================
--  Columna auxiliar: estatus_reclutamiento
--  (si no existe de una migración previa) — para controlar
--  el flujo de acceso en la página /evaluacion/[candidato_id]
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'candidatos'
      AND column_name = 'estatus_reclutamiento'
  ) THEN
    ALTER TABLE public.candidatos
      ADD COLUMN estatus_reclutamiento VARCHAR(30) NOT NULL DEFAULT 'Pendiente';
  END IF;
END $$;

COMMENT ON COLUMN public.candidatos.estatus_reclutamiento IS
  'Estado del flujo: Pendiente | En_Progreso | Completada | Cancelada | Inasistencia.';

-- ============================================================
--  Función helper: genera un token único intentando N veces
--  antes de declarar colisión persistente.
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_unique_token(
  p_longitud INT DEFAULT 7,
  p_max_intentos INT DEFAULT 20
) RETURNS VARCHAR(8)
LANGUAGE plpgsql
AS $$
DECLARE
  v_alfabeto TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_token    VARCHAR(8);
  v_existe   BOOLEAN;
  v_intento  INT := 0;
BEGIN
  LOOP
    v_intento := v_intento + 1;
    v_token := '';
    FOR i IN 1..p_longitud LOOP
      v_token := v_token || substr(v_alfabeto, 1 + (random() * length(v_alfabeto))::INT, 1);
    END LOOP;

    SELECT EXISTS (
      SELECT 1 FROM public.candidatos WHERE token_acceso = v_token
    ) INTO v_existe;

    EXIT WHEN NOT v_existe;
    EXIT WHEN v_intento >= p_max_intentos;
  END LOOP;

  RETURN v_token;
END;
$$;