-- ============================================================
--  01_enums.sql
--  Enums centralizados para garantizar consistencia en todo
--  el schema (Postgres los aplica a nivel nativo).
-- ============================================================

-- Roles de usuario (RBAC)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'Super_Admin',
    'Administrador_Agencia',
    'Coordinador',
    'Reclutador_Freelance',
    'Cliente_SaaS',
    'Cliente_Invitado'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Giro industrial del workspace
DO $$ BEGIN
  CREATE TYPE giro_industrial AS ENUM (
    'Seguridad_Privada',
    'Logistica',
    'Retail',
    'Corporativo',
    'Industrial',
    'Hospitalidad',
    'Tecnologia',
    'Otro'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Planes de suscripción SaaS
DO $$ BEGIN
  CREATE TYPE plan_suscripcion AS ENUM (
    'Trial',
    'Starter',
    'Professional',
    'Enterprise',
    'Custom'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tipos de jornada laboral
DO $$ BEGIN
  CREATE TYPE tipo_jornada_enum AS ENUM (
    'Fijo',
    'Rolado',
    'Ciclico'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Estatus de vacante
DO $$ BEGIN
  CREATE TYPE estatus_vacante AS ENUM (
    'Abierta',
    'Cerrada',
    'Pausada'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Interés declarado por un prospecto
DO $$ BEGIN
  CREATE TYPE interes_prospecto AS ENUM (
    'SaaS',
    'Freelance',
    'Ambos'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Estatus del prospecto en el pipeline de aprobación
DO $$ BEGIN
  CREATE TYPE estatus_prospecto AS ENUM (
    'Nuevo',
    'En_Review',
    'Aprobado',
    'Rechazado',
    'Contactado'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7 Categorías del catálogo de pruebas psicométricas
DO $$ BEGIN
  CREATE TYPE prueba_categoria AS ENUM (
    'Integridad',
    'Logica',
    'Personalidad',
    'Motivadores',
    'Liderazgo',
    'Ventas',
    'Trato_Cliente'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;