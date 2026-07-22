-- ============================================================
--  12_seed_share_demo.sql
--  Datos de demostración para el portal /compartir/[token].
--  Crea una vacante demo con candidatos aprobados y un
--  share_link con token conocido para pruebas.
-- ============================================================

-- Solo correr si la vacante demo ya existe (creada en otro script
-- o manualmente). Si no existe, este script no hace nada.

DO $$
DECLARE
  v_vacante_id UUID;
  v_token      VARCHAR(64) := 'demo-secure-token-no-usar-en-prod-7f3a8b9c2d1e';
BEGIN
  -- Buscar la primera vacante "Abierta" del workspace demo.
  SELECT id INTO v_vacante_id
  FROM public.vacantes
  WHERE estatus = 'Abierta'
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_vacante_id IS NULL THEN
    RAISE NOTICE 'No hay vacantes demo. Crea una primero desde /crear-vacante.';
    RETURN;
  END IF;

  -- Crear (o re-crear) el share link de demo.
  INSERT INTO public.share_links (token, vacante_id, label, expires_at)
  VALUES (
    v_token,
    v_vacante_id,
    'Demo · Enlace para cliente externo',
    now() + interval '30 days'
  )
  ON CONFLICT (token) DO UPDATE
    SET vacante_id = EXCLUDED.vacante_id,
        expires_at = EXCLUDED.expires_at,
        revoked_at = NULL;

  RAISE NOTICE 'Share link demo creado:';
  RAISE NOTICE '  Token: %', v_token;
  RAISE NOTICE '  Vacante: %', v_vacante_id;
  RAISE NOTICE '  URL: /compartir/%', v_token;
END $$;