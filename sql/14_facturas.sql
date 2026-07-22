-- ============================================================
--  14_facturas.sql
--  Tabla de Facturación + Paywall para HR CORE
-- ============================================================

-- ============================================================
--  Enums
-- ============================================================
DO $$ BEGIN
  CREATE TYPE metodo_pago_enum AS ENUM ('Tarjeta', 'Transferencia');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE estatus_factura_enum AS ENUM ('Pendiente', 'En_Revision', 'Pagada', 'Cancelada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
--  Tabla principal de Facturas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.facturas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id      UUID NOT NULL REFERENCES public.workspaces_empresas(id) ON DELETE CASCADE,
  vacante_id        UUID REFERENCES public.vacantes(id) ON DELETE SET NULL,
  monto             NUMERIC(12,2) NOT NULL CHECK (monto >= 0),
  moneda            VARCHAR(3) NOT NULL DEFAULT 'MXN',
  metodo_pago       metodo_pago_enum,         -- null hasta que se pague
  estatus           estatus_factura_enum NOT NULL DEFAULT 'Pendiente',
  descripcion       TEXT,
  referencia_externa VARCHAR(100),           -- ej: stripe_payment_intent_id
  notas_internas    TEXT,
  fecha_pago        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_facturas_workspace ON public.facturas(workspace_id);
CREATE INDEX IF NOT EXISTS idx_facturas_vacante   ON public.facturas(vacante_id);
CREATE INDEX IF NOT EXISTS idx_facturas_estatus   ON public.facturas(estatus);
CREATE INDEX IF NOT EXISTS idx_facturas_created   ON public.facturas(created_at DESC);

COMMENT ON TABLE public.facturas IS
  'Facturas emitidas al cliente por honorarios de headhunting. Una vacante puede tener varias facturas.';

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_facturas_set_updated_at ON public.facturas;
CREATE TRIGGER trg_facturas_set_updated_at
  BEFORE UPDATE ON public.facturas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
--  RLS — Row Level Security
-- ============================================================
ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;

-- Super_Admin: full access
CREATE POLICY "super_admin_all_facturas" ON public.facturas
  FOR ALL TO authenticated
  USING  (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Admin / Coordinador de la agencia: ven y editan facturas de SU workspace
CREATE POLICY "admin_agencia_manage_facturas" ON public.facturas
  FOR ALL TO authenticated
  USING (
    workspace_id = public.get_user_workspace()
    AND public.has_any_role(ARRAY['Administrador_Agencia','Coordinador']::user_role[])
  )
  WITH CHECK (
    workspace_id = public.get_user_workspace()
    AND public.has_any_role(ARRAY['Administrador_Agencia','Coordinador']::user_role[])
  );

-- Cliente_SaaS: SOLO lectura de las facturas de SU workspace
-- (no puede modificar el estatus — eso lo hace el Super_Admin
--  o el sistema de pagos).
CREATE POLICY "cliente_saas_view_facturas" ON public.facturas
  FOR SELECT TO authenticated
  USING (
    workspace_id = public.get_user_workspace()
    AND public.get_user_role() = 'Cliente_SaaS'
  );

-- ============================================================
--  Vista "última factura por vacante" — para el paywall
-- ============================================================
CREATE OR REPLACE VIEW public.ultima_factura_por_vacante AS
SELECT DISTINCT ON (vacante_id)
  f.id,
  f.workspace_id,
  f.vacante_id,
  f.monto,
  f.moneda,
  f.metodo_pago,
  f.estatus,
  f.fecha_pago,
  f.created_at
FROM public.facturas f
WHERE f.vacante_id IS NOT NULL
ORDER BY f.vacante_id, f.created_at DESC;

COMMENT ON VIEW public.ultima_factura_por_vacante IS
  'Para el paywall: última factura por vacante. Si estatus ∈ {Pendiente, En_Revision} → bloquear contacto.';