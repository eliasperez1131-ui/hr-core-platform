-- ============================================================
--  10_seed_catalogo.sql
--  7 bloques del catálogo de pruebas psicométricas (B2B).
-- ============================================================

INSERT INTO public.catalogo_pruebas
  (codigo, categoria, nombre, descripcion_corta, descripcion_larga, duracion_estimada_min, confiabilidad_pct)
VALUES
  (
    'INT-01', 'Integridad',
    'Test de Integridad Organizacional',
    'Mide honestidad, cumplimiento de normas y resistencia a la presión.',
    'Evalúa la disposición del candidato a seguir políticas internas y resistir presiones externas que comprometan la ética. Crítico para roles con manejo de efectivo, inventarios o información confidencial.',
    25, 92.50
  ),
  (
    'LOG-01', 'Logica',
    'Razonamiento Lógico-Matemático',
    'Capacidad de análisis, patrones y resolución de problemas.',
    'Mide pensamiento abstracto, razonamiento numérico y verbal. Predictor clave de desempeño operativo en logística, mantenimiento y roles técnicos.',
    30, 95.00
  ),
  (
    'PER-01', 'Personalidad',
    'Perfil Big Five (OCEAN)',
    'Apertura, Responsabilidad, Extroversión, Amabilidad, Neuroticismo.',
    'Inventario de los cinco grandes factores de personalidad. Permite matchear el perfil del candidato con la cultura del workspace y el puesto específico.',
    20, 90.00
  ),
  (
    'MOT-01', 'Motivadores',
    'Mapa de Motivadores Laborales',
    'Logro, afiliación, reconocimiento, poder, servicio.',
    'Identifica qué двигатель interno mueve al candidato. Útil para diseñar planes de compensación variable y retención temprana.',
    15, 88.00
  ),
  (
    'LID-01', 'Liderazgo',
    'Estilos de Liderazgo Situacional',
    'Capacidad de dirigir, decidir y gestionar conflictos.',
    'Evalúa si el candidato adapta su estilo (dirigir, entrenar, apoyar, delegar) según la madurez del equipo. Predictor de promoción a coordinadores.',
    35, 91.00
  ),
  (
    'VEN-01', 'Ventas',
    'Competencias Comerciales',
    'Prospección, cierre, resiliencia y orientación al cliente.',
    'Mide las habilidades necesarias para roles comerciales: orientación al cliente, tolerancia al rechazo, planificación y cierre.',
    25, 89.50
  ),
  (
    'TC-01', 'Trato_Cliente',
    'Servicio y Atención al Cliente',
    'Empatía, paciencia, comunicación y manejo de presión.',
    'Evalúa la capacidad de escuchar, gestionar quejas y mantener la satisfacción del cliente bajo presión. Esencial para retail, hospitalidad y soporte.',
    20, 90.50
  )
ON CONFLICT (codigo) DO NOTHING;