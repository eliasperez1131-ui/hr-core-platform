export const PRUEBAS_CATALOGO = [
  {
    codigo: 'INT-01',
    categoria: 'Integridad',
    nombre: 'Test de Integridad Organizacional',
    descripcion:
      'Mide honestidad, cumplimiento de normas y resistencia a la presión. Reduce robo hormiga y rotación por faltas éticas.',
    icono: 'shield-check',
    color: 'from-emerald-400 to-emerald-600',
    metricas: ['25 min', 'Confiabilidad 92%', 'Validado en campo'],
  },
  {
    codigo: 'LOG-01',
    categoria: 'Logica',
    nombre: 'Razonamiento Lógico-Matemático',
    descripcion:
      'Evalúa capacidad de análisis, resolución de problemas y pensamiento abstracto.',
    icono: 'cpu',
    color: 'from-blue-400 to-blue-600',
    metricas: ['30 min', 'Confiabilidad 95%', 'Predictor operativo'],
  },
  {
    codigo: 'PER-01',
    categoria: 'Personalidad',
    nombre: 'Perfil Big Five (OCEAN)',
    descripcion:
      'Apertura, Responsabilidad, Extroversión, Amabilidad y Neuroticismo. Match cultural automatizado.',
    icono: 'brain',
    color: 'from-violet-400 to-violet-600',
    metricas: ['20 min', 'Confiabilidad 90%', '5 dimensiones'],
  },
  {
    codigo: 'MOT-01',
    categoria: 'Motivadores',
    nombre: 'Mapa de Motivadores Laborales',
    descripcion:
      'Identifica qué двигатель interno mueve al candidato: logro, afiliación, poder, servicio o reconocimiento.',
    icono: 'rocket',
    color: 'from-amber-400 to-orange-500',
    metricas: ['15 min', 'Confiabilidad 88%', '5 drivers'],
  },
  {
    codigo: 'LID-01',
    categoria: 'Liderazgo',
    nombre: 'Liderazgo Situacional',
    descripcion:
      'Evalúa la capacidad de adaptar el estilo de liderazgo a la madurez del equipo. Predictor de promoción.',
    icono: 'crown',
    color: 'from-rose-400 to-pink-600',
    metricas: ['35 min', 'Confiabilidad 91%', '4 estilos'],
  },
  {
    codigo: 'VEN-01',
    categoria: 'Ventas',
    nombre: 'Competencias Comerciales',
    descripcion:
      'Prospección, cierre, resiliencia y orientación al cliente. Ideal para fuerzas de venta B2B y B2C.',
    icono: 'trending-up',
    color: 'from-cyan-400 to-cyan-600',
    metricas: ['25 min', 'Confiabilidad 89%', '4 competencias'],
  },
  {
    codigo: 'TC-01',
    categoria: 'Trato al Cliente',
    nombre: 'Servicio y Atención al Cliente',
    descripcion:
      'Empatía, paciencia, comunicación y manejo de presión bajo estándares NPS.',
    icono: 'headphones',
    color: 'from-indigo-400 to-indigo-600',
    metricas: ['20 min', 'Confiabilidad 90%', 'Retail / Hospitalidad'],
  },
];

export const PLANES = [
  {
    id: 'starter',
    nombre: 'Starter',
    precio: '$ 1,490',
    periodicidad: '/ mes',
    descripcion: 'Para agencias pequeñas que inician con evaluaciones.',
    destacado: false,
    features: [
      'Hasta 50 candidatos / mes',
      'Catálogo completo (7 pruebas)',
      '1 reclutador incluido',
      'Reportes PDF automáticos',
      'Soporte por correo',
    ],
    cta: 'Comenzar Trial',
  },
  {
    id: 'professional',
    nombre: 'Professional',
    precio: '$ 3,990',
    periodicidad: '/ mes',
    descripcion: 'El más popular. Para agencias y empresas en crecimiento.',
    destacado: true,
    features: [
      'Hasta 250 candidatos / mes',
      'Catálogo completo + integridades',
      'Hasta 5 reclutadores',
      'ATS pipeline Kanban',
      'Roles privados y delicadas',
      'Soporte prioritario 24/5',
    ],
    cta: 'Contratar ahora',
  },
  {
    id: 'enterprise',
    nombre: 'Enterprise',
    precio: 'A medida',
    periodicidad: '',
    descripcion: 'Soluciones corporativas con SLA dedicado y SSO.',
    destacado: false,
    features: [
      'Candidatos ilimitados',
      'Multi-workspace / multi-marca',
      'SSO + SCIM + auditoría',
      'API y webhooks a la medida',
      'CSM dedicado',
      'SLA 99.9% contractual',
    ],
    cta: 'Hablar con ventas',
  },
];