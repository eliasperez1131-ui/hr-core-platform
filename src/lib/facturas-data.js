/**
 * ============================================================
 *  HR CORE · Datos Demo + Helpers de Facturas / Paywall
 * ============================================================
 *
 *  Capa de abstracción para que el portal funcione tanto en modo
 *  DEMO (sin Supabase) como en producción.
 *
 *  El paywall:
 *   - Una vacante se considera "deuda activa" si la última factura
 *     está en estatus Pendiente o En_Revision.
 *   - En ese caso, el Magic Link público y el Talento VIP ocultan
 *     teléfono, correo y CV.
 */

// ============================================================
//  Datos demo
// ============================================================
export const DEMO_WORKSPACE_ID = 'ws-hr-core-demo';
export const DEMO_VACANTE_ID   = 'v-headhunting-demo-1';

export const DEMO_FACTURAS = [
  {
    id: 'fac-001',
    workspace_id: DEMO_WORKSPACE_ID,
    vacante_id:   'v1',
    monto:        22000,
    moneda:       'MXN',
    metodo_pago:   null,
    estatus:      'Pagada',
    descripcion:   'Headhunting · Guardia de Seguridad Intramuros — Cierre Enero',
    fecha_pago:    '2026-01-30T14:20:00Z',
    created_at:    '2026-01-15T10:00:00Z',
  },
  {
    id: 'fac-002',
    workspace_id: DEMO_WORKSPACE_ID,
    vacante_id:   'v3',
    monto:        33000,
    moneda:       'MXN',
    metodo_pago:   'Tarjeta',
    estatus:      'Pendiente',
    descripcion:   'Headhunting · Supervisor de Turno — Cierre Marzo',
    fecha_pago:    null,
    created_at:    '2026-03-10T09:00:00Z',
  },
  {
    id: 'fac-003',
    workspace_id: DEMO_WORKSPACE_ID,
    vacante_id:   'v2',
    monto:        26400,
    moneda:       'MXN',
    metodo_pago:   'Transferencia',
    estatus:      'En_Revision',
    descripcion:   'Headhunting · Guardia Rondín Nocturno — Cierre Febrero',
    fecha_pago:    null,
    created_at:    '2026-02-20T11:30:00Z',
  },
  {
    id: 'fac-004',
    workspace_id: DEMO_WORKSPACE_ID,
    vacante_id:   'v4',
    monto:        18500,
    moneda:       'MXN',
    metodo_pago:   null,
    estatus:      'Pendiente',
    descripcion:   'Headhunting · Auxiliar de Monitoreo CCTV',
    fecha_pago:    null,
    created_at:    '2026-07-15T08:00:00Z',
  },
];

/**
 * Catálogo demo de candidatos VIP (headhunting) para el portal cliente.
 */
export const DEMO_CANDIDATOS_VIP = [
  {
    id: 'cand-vip-1',
    nombre_completo: 'Roberto Carlos Fuentes Mendoza',
    correo:          'roberto.fuentes@gmail.com',
    telefono:        '+52 55 8845 1290',
    edad:            32,
    escolaridad:     'Licenciatura en Derecho',
    estado:          'CDMX',
    municipio:       'Miguel Hidalgo',
    inicial:         'RF',
    baremo:          'Muy Alto',
    integridad_pct:  91,
    cognitivo_pct:   84,
    eje_disc:        'D · Dominancia',
  },
  {
    id: 'cand-vip-2',
    nombre_completo: 'María José Hernández Ortiz',
    correo:          'mariajose.hdz@outlook.com',
    telefono:        '+52 55 4422 6633',
    edad:            29,
    escolaridad:     'Ingeniería Industrial',
    estado:          'Edo. México',
    municipio:       'Naucalpan',
    inicial:         'MH',
    baremo:          'Alto',
    integridad_pct:  84,
    cognitivo_pct:   76,
    eje_disc:        'I · Influencia',
  },
  {
    id: 'cand-vip-3',
    nombre_completo: 'Luis Ángel Pérez Solís',
    correo:          'luis.perez.solis@gmail.com',
    telefono:        '+52 33 2244 8855',
    edad:            35,
    escolaridad:     'Maestría en Seguridad',
    estado:          'Jalisco',
    municipio:       'Guadalajara',
    inicial:         'LP',
    baremo:          'Alto',
    integridad_pct:  82,
    cognitivo_pct:   88,
    eje_disc:        'C · Cumplimiento',
  },
];

/**
 * Datos bancarios demo de la agencia HR CORE.
 */
export const DEMO_DATOS_BANCARIOS = {
  banco:    'BBVA México',
  titular:  'HR CORE S.A. de C.V.',
  clabe:    '012180001234567890',
  cuenta:   '1234 5678 90',
  swift:    'BCMRMXMM',
  referencia_default: 'HR CORE — Servicios de Headhunting',
};

// ============================================================
//  Helpers
// ============================================================

/**
 * Devuelve la lista de facturas de un workspace (demo).
 * En producción: fetch a Supabase filtrando por workspace_id.
 */
export function getFacturasByWorkspace(workspaceId) {
  return DEMO_FACTURAS
    .filter((f) => f.workspace_id === workspaceId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * Devuelve la última factura de una vacante (para el paywall).
 * En producción: SELECT * FROM facturas WHERE vacante_id = ? ORDER BY created_at DESC LIMIT 1.
 */
export function getUltimaFacturaByVacante(vacanteId) {
  const facturas = DEMO_FACTURAS
    .filter((f) => f.vacante_id === vacanteId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return facturas[0] || null;
}

/**
 * Reglas del paywall.
 *
 * Una vacante está "bloqueada" (deuda activa) si:
 *   - Existe al menos una factura, Y
 *   - La más reciente está en estatus Pendiente o En_Revision.
 *
 * Si no hay factura o la última está Pagada/Cancelada → desbloqueada.
 */
export function esVacanteBloqueada(vacanteId) {
  const ultima = getUltimaFacturaByVacante(vacanteId);
  if (!ultima) return { bloqueada: false, factura: null };
  const bloqueada = ['Pendiente', 'En_Revision'].includes(ultima.estatus);
  return { bloqueada, factura: bloqueada ? ultima : null };
}

/**
 * Versión batch — devuelve un mapa { vacanteId → estado }.
 */
export function getPaywallPorVacantes(vacanteIds = []) {
  const out = {};
  for (const id of vacanteIds) {
    out[id] = esVacanteBloqueada(id);
  }
  return out;
}

/**
 * Resumen financiero de un workspace.
 */
export function getResumenFinanciero(workspaceId) {
  const facturas = getFacturasByWorkspace(workspaceId);
  const total       = facturas.reduce((acc, f) => acc + f.monto, 0);
  const pagado      = facturas.filter((f) => f.estatus === 'Pagada').reduce((a, f) => a + f.monto, 0);
  const pendiente   = facturas.filter((f) => f.estatus === 'Pendiente').reduce((a, f) => a + f.monto, 0);
  const enRevision  = facturas.filter((f) => f.estatus === 'En_Revision').reduce((a, f) => a + f.monto, 0);
  return {
    total,
    pagado,
    pendiente,
    en_revision: enRevision,
    count: {
      total:      facturas.length,
      pagadas:    facturas.filter((f) => f.estatus === 'Pagada').length,
      pendientes: facturas.filter((f) => f.estatus === 'Pendiente').length,
      en_revision: facturas.filter((f) => f.estatus === 'En_Revision').length,
    },
  };
}

/**
 * Encuentra la factura por id (demo).
 */
export function getFacturaById(id) {
  return DEMO_FACTURAS.find((f) => f.id === id) || null;
}