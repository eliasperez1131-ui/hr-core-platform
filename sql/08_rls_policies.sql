-- ============================================================
--  08_rls_policies.sql
--  Row Level Security — la pieza más crítica del sistema.
--  Cada política está comentada con el rol al que aplica.
-- ============================================================

-- ============================================================
--  WORKSPACES_EMPRESAS
-- ============================================================

CREATE POLICY "super_admin_all_workspaces" ON public.workspaces_empresas
  FOR ALL TO authenticated
  USING  (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "users_view_own_workspace" ON public.workspaces_empresas
  FOR SELECT TO authenticated
  USING (
    id = public.get_user_workspace()
    OR public.is_super_admin()
  );

CREATE POLICY "admin_agencia_update_own_workspace" ON public.workspaces_empresas
  FOR UPDATE TO authenticated
  USING (
    id = public.get_user_workspace()
    AND public.get_user_role() IN ('Administrador_Agencia', 'Coordinador')
  )
  WITH CHECK (
    id = public.get_user_workspace()
    AND public.get_user_role() IN ('Administrador_Agencia', 'Coordinador')
  );

-- ============================================================
--  USER_PROFILES
-- ============================================================

CREATE POLICY "super_admin_all_profiles" ON public.user_profiles
  FOR ALL TO authenticated
  USING  (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "users_view_own_profile" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_super_admin());

CREATE POLICY "users_update_own_profile" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING     (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "admin_view_workspace_profiles" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (
    workspace_id = public.get_user_workspace()
    AND public.get_user_role() IN ('Administrador_Agencia', 'Coordinador')
  );

-- ============================================================
--  CANDIDATOS
-- ============================================================

CREATE POLICY "super_admin_all_candidatos" ON public.candidatos
  FOR ALL TO authenticated
  USING  (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "workspace_staff_manage_candidatos" ON public.candidatos
  FOR ALL TO authenticated
  USING (
    workspace_id = public.get_user_workspace()
    AND public.get_user_role() IN ('Administrador_Agencia', 'Coordinador', 'Reclutador_Freelance')
  )
  WITH CHECK (
    workspace_id = public.get_user_workspace()
    AND public.get_user_role() IN ('Administrador_Agencia', 'Coordinador', 'Reclutador_Freelance')
  );

CREATE POLICY "cliente_saas_view_candidatos" ON public.candidatos
  FOR SELECT TO authenticated
  USING (
    workspace_id = public.get_user_workspace()
    AND public.get_user_role() = 'Cliente_SaaS'
  );

-- ============================================================
--  VACANTES  (tabla base)
--  Los freelancers y clientes SOLO deben usar la vista
--  vacantes_public_view para evitar exponer info financiera.
--  Aquí se controla el acceso a la tabla completa.
-- ============================================================

CREATE POLICY "super_admin_all_vacantes" ON public.vacantes
  FOR ALL TO authenticated
  USING  (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "admin_coordinador_manage_vacantes" ON public.vacantes
  FOR ALL TO authenticated
  USING (
    workspace_id = public.get_user_workspace()
    AND public.get_user_role() IN ('Administrador_Agencia', 'Coordinador')
  )
  WITH CHECK (
    workspace_id = public.get_user_workspace()
    AND public.get_user_role() IN ('Administrador_Agencia', 'Coordinador')
  );

-- Reclutador Freelance: solo lectura de filas asignadas a él
CREATE POLICY "freelance_view_assigned_vacantes" ON public.vacantes
  FOR SELECT TO authenticated
  USING (
    asignado_a_coordinador_id = auth.uid()
    AND public.get_user_role() = 'Reclutador_Freelance'
  );

-- Cliente_SaaS: solo lectura de su workspace (sin info financiera)
-- (en la práctica la UI debe usar vacantes_public_view)
CREATE POLICY "cliente_saas_view_workspace_vacantes" ON public.vacantes
  FOR SELECT TO authenticated
  USING (
    workspace_id = public.get_user_workspace()
    AND public.get_user_role() = 'Cliente_SaaS'
  );

-- ============================================================
--  VACANTE_CANDIDATOS (pipeline)
-- ============================================================

CREATE POLICY "workspace_staff_manage_pipeline" ON public.vacante_candidatos
  FOR ALL TO authenticated
  USING (
    public.is_super_admin()
    OR (
      public.get_user_role() IN ('Administrador_Agencia', 'Coordinador', 'Reclutador_Freelance')
      AND EXISTS (
        SELECT 1 FROM public.vacantes v
        WHERE v.id = vacante_candidatos.vacante_id
          AND v.workspace_id = public.get_user_workspace()
      )
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.get_user_role() IN ('Administrador_Agencia', 'Coordinador', 'Reclutador_Freelance')
  );

-- ============================================================
--  PROSPECTOS_PENDIENTES
--  Inserción abierta (formulario público).
--  Lectura / edición restringida a Admin.
-- ============================================================

CREATE POLICY "public_insert_prospecto" ON public.prospectos_pendientes
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "admin_view_prospectos" ON public.prospectos_pendientes
  FOR SELECT TO authenticated
  USING (
    public.get_user_role() IN ('Super_Admin', 'Administrador_Agencia')
  );

CREATE POLICY "admin_update_prospectos" ON public.prospectos_pendientes
  FOR UPDATE TO authenticated
  USING (
    public.get_user_role() IN ('Super_Admin', 'Administrador_Agencia')
  )
  WITH CHECK (
    public.get_user_role() IN ('Super_Admin', 'Administrador_Agencia')
  );

-- ============================================================
--  CATALOGO_PRUEBAS
-- ============================================================

CREATE POLICY "anon_view_catalogo" ON public.catalogo_pruebas
  FOR SELECT TO anon
  USING (activo = true);

CREATE POLICY "authenticated_view_catalogo" ON public.catalogo_pruebas
  FOR SELECT TO authenticated
  USING (activo = true OR public.is_super_admin());

CREATE POLICY "super_admin_manage_catalogo" ON public.catalogo_pruebas
  FOR ALL TO authenticated
  USING  (public.is_super_admin())
  WITH CHECK (public.is_super_admin());