-- ============================================================
--  02_user_profiles.sql
--  Extiende auth.users de Supabase con metadata de aplicación
--  (rol, workspace, datos de contacto).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rol             user_role NOT NULL DEFAULT 'Cliente_Invitado',
  workspace_id    UUID,
  nombre_completo VARCHAR(150),
  telefono        VARCHAR(20),
  avatar_url      TEXT,
  activo          BOOLEAN NOT NULL DEFAULT true,
  ultimo_login    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_workspace ON public.user_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_rol       ON public.user_profiles(rol);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
--  Funciones helper (SECURITY DEFINER) usadas por las políticas
--  RLS para evitar recursión y exponer lógica reutilizable.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rol FROM public.user_profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_workspace()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT workspace_id FROM public.user_profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND rol = 'Super_Admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(roles user_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND rol = ANY(roles)
  );
$$;

-- Trigger: cuando se crea un usuario en auth.users, crear su perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, nombre_completo, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'rol')::user_role, 'Cliente_Invitado')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();