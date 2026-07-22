-- ============================================================
--  05_vacantes.sql
--  Puestos publicados. Los campos financieros (cobro_cliente /
--  comision_freelance) están físicamente en esta tabla pero
--  se ocultan vía la vista vacantes_public_view + RLS.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.vacantes (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo_puesto               VARCHAR(150) NOT NULL,
  workspace_id                UUID NOT NULL REFERENCES public.workspaces_empresas(id) ON DELETE CASCADE,
  asignado_a_coordinador_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creado_por                  UUID REFERENCES auth.users(id),

  -- OPERATIVOS (visibles para todos los miembros del workspace)
  descripcion                 TEXT,
  requisitos                  TEXT,
  beneficios                  TEXT,
  tipo_jornada                tipo_jornada_enum NOT NULL DEFAULT 'Fijo',
  detalle_turno               VARCHAR(150),
  modalidad                   VARCHAR(50),
  ubicacion                   VARCHAR(200),
  sueldo_candidato            NUMERIC(12,2),

  -- FINANCIEROS (RESTRINGIDOS — solo Admin_Agencia / Coordinador / Super_Admin)
  cobro_cliente               NUMERIC(12,2),
  comision_freelance          NUMERIC(12,2),

  -- CONFIGURACIÓN
  es_delicada                 BOOLEAN NOT NULL DEFAULT false,
  estatus                     estatus_vacante NOT NULL DEFAULT 'Abierta',
  vacantes_disponibles        INT NOT NULL DEFAULT 1,
  fecha_publicacion           TIMESTAMPTZ,
  fecha_cierre                TIMESTAMPTZ,

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vacantes_workspace      ON public.vacantes (workspace_id);
CREATE INDEX IF NOT EXISTS idx_vacantes_coordinador    ON public.vacantes (asignado_a_coordinador_id);
CREATE INDEX IF NOT EXISTS idx_vacantes_estatus        ON public.vacantes (estatus);
CREATE INDEX IF NOT EXISTS idx_vacantes_es_delicada    ON public.vacantes (es_delicada);

ALTER TABLE public.vacantes ENABLE ROW LEVEL SECURITY;

-- ============================================================
--  VISTAS DE SEGURIDAD
-- ============================================================

-- Vista operativa (oculta campos financieros).
-- La concedemos como "tabla" lógica para Reclutadores y Clientes.
CREATE OR REPLACE VIEW public.vacantes_public_view AS
SELECT
  id,
  titulo_puesto,
  workspace_id,
  asignado_a_coordinador_id,
  creado_por,
  descripcion,
  requisitos,
  beneficios,
  tipo_jornada,
  detalle_turno,
  modalidad,
  ubicacion,
  sueldo_candidato,
  es_delicada,
  estatus,
  vacantes_disponibles,
  fecha_publicacion,
  fecha_cierre,
  created_at,
  updated_at
FROM public.vacantes;

COMMENT ON VIEW public.vacantes_public_view IS
  'Vista sin columnas financieras (cobro_cliente, comision_freelance). Úsala para roles Reclutador_Freelance y Cliente_SaaS.';

-- Vista completa (con campos financieros) para roles privilegiados.
CREATE OR REPLACE VIEW public.vacantes_full_view AS
SELECT * FROM public.vacantes;

COMMENT ON VIEW public.vacantes_full_view IS
  'Vista completa con campos financieros. Restringida por RLS a Super_Admin, Administrador_Agencia y Coordinador.';

-- ============================================================
--  Tabla puente Vacante <-> Candidato (estado de postulación)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vacante_candidatos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vacante_id      UUID NOT NULL REFERENCES public.vacantes(id) ON DELETE CASCADE,
  candidato_id    UUID NOT NULL REFERENCES public.candidatos(id) ON DELETE CASCADE,
  estatus         VARCHAR(30) NOT NULL DEFAULT 'Postulado',
  puntuacion      NUMERIC(5,2),
  notas           TEXT,
  asistido        BOOLEAN,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vacante_id, candidato_id)
);

CREATE INDEX IF NOT EXISTS idx_vacante_candidatos_vacante   ON public.vacante_candidatos (vacante_id);
CREATE INDEX IF NOT EXISTS idx_vacante_candidatos_candidato ON public.vacante_candidatos (candidato_id);

ALTER TABLE public.vacante_candidatos ENABLE ROW LEVEL SECURITY;