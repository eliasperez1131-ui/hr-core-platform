/**
 * Datos mock realistas para que los dashboards sean visualizables
 * sin necesidad de tener Supabase poblado. Cuando el backend
 * esté conectado, las funciones reales reemplazarán estos mocks.
 */

export const PLANES_DEMO = {
  Starter:     { creditos_incluidos: 50,   creditos_usados: 18,  renovacion: '2026-08-15' },
  Professional:{ creditos_incluidos: 250,  creditos_usados: 187, renovacion: '2026-08-15' },
  Enterprise:  { creditos_incluidos: 1000, creditos_usados: 612, renovacion: '2026-09-01' },
};

export const WORKSPACE_DEMO = {
  id: 'ws-demo-001',
  nombre_empresa: 'Grupo Seguridad del Norte S.A. de C.V.',
  giro_industrial: 'Seguridad_Privada',
  plan_activo: 'Professional',
};

export const FREELANCE_DEMO = {
  id: 'usr-freelance-001',
  nombre_completo: 'Daniela Castañeda',
  telefono: '+52 55 4422 8831',
  avatar_initials: 'DC',
};

export const ACTIVIDAD_RECIENTE = [
  {
    id: 'a1',
    candidato: 'Ana Reyes Hernández',
    avatar: 'AR',
    vacante: 'Guardia de Seguridad Intramuros',
    prueba: 'Integridad Organizacional',
    score: 94,
    estatus: 'Top Match',
    completado_en: '2026-07-18T14:32:00Z',
  },
  {
    id: 'a2',
    candidato: 'Carlos Méndez Ruiz',
    avatar: 'CM',
    vacante: 'Auxiliar de Almacén CEDIS',
    prueba: 'Razonamiento Lógico',
    score: 87,
    estatus: 'Apto',
    completado_en: '2026-07-18T11:08:00Z',
  },
  {
    id: 'a3',
    candidato: 'Lucía Torres Vega',
    avatar: 'LT',
    vacante: 'Ejecutiva de Ventas Tienda',
    prueba: 'Competencias Comerciales',
    score: 78,
    estatus: 'Revisar',
    completado_en: '2026-07-17T19:21:00Z',
  },
  {
    id: 'a4',
    candidato: 'Miguel Núñez Pérez',
    avatar: 'MN',
    vacante: 'Jefe de Turno Nocturno',
    prueba: 'Liderazgo Situacional',
    score: 95,
    estatus: 'Top Match',
    completado_en: '2026-07-17T16:00:00Z',
  },
  {
    id: 'a5',
    candidato: 'Sofía Lara Domínguez',
    avatar: 'SL',
    vacante: 'Atención al Cliente Sucursal',
    prueba: 'Servicio al Cliente',
    score: 91,
    estatus: 'Top Match',
    completado_en: '2026-07-17T09:45:00Z',
  },
  {
    id: 'a6',
    candidato: 'Roberto Quintero',
    avatar: 'RQ',
    vacante: 'Guardia de Seguridad Intramuros',
    prueba: 'Integridad Organizacional',
    score: 62,
    estatus: 'No Apto',
    completado_en: '2026-07-16T13:20:00Z',
  },
];

export const VACANTES_ASIGNADAS_FREELANCE = [
  {
    id: 'v1',
    titulo_puesto: 'Guardia de Seguridad Intramuros',
    empresa: 'Grupo Seguridad del Norte',
    tipo_jornada: 'Ciclico',
    detalle_turno: '24x24',
    modalidad: 'Presencial',
    ubicacion: 'Santa Fe, CDMX',
    sueldo_candidato: 12500,
    candidatos_activos: 8,
    estatus: 'Abierta',
    es_delicada: false,
  },
  {
    id: 'v2',
    titulo_puesto: 'Guardia Rondín (Nocturno)',
    empresa: 'Grupo Seguridad del Norte',
    tipo_jornada: 'Fijo',
    detalle_turno: 'Noche fija (22:00-06:00)',
    modalidad: 'Presencial',
    ubicacion: 'Polanco, CDMX',
    sueldo_candidato: 14200,
    candidatos_activos: 3,
    estatus: 'Abierta',
    es_delicada: true,
  },
  {
    id: 'v3',
    titulo_puesto: 'Supervisor de Turno',
    empresa: 'Grupo Seguridad del Norte',
    tipo_jornada: 'Rolado',
    detalle_turno: '4x4',
    modalidad: 'Presencial',
    ubicacion: 'Tlalnepantla, Edo. Méx.',
    sueldo_candidato: 18500,
    candidatos_activos: 5,
    estatus: 'Abierta',
    es_delicada: true,
  },
  {
    id: 'v4',
    titulo_puesto: 'Auxiliar de Monitoreo CCTV',
    empresa: 'Grupo Seguridad del Norte',
    tipo_jornada: 'Ciclico',
    detalle_turno: '12x12',
    modalidad: 'Presencial',
    ubicacion: 'Centro, CDMX',
    sueldo_candidato: 11800,
    candidatos_activos: 2,
    estatus: 'Pausada',
    es_delicada: false,
  },
  {
    id: 'v5',
    titulo_puesto: 'Jefe de Seguridad Corporativa',
    empresa: 'Grupo Seguridad del Norte',
    tipo_jornada: 'Fijo',
    detalle_turno: 'L-V 9-18',
    modalidad: 'Presencial',
    ubicacion: 'Reforma 222, CDMX',
    sueldo_candidato: 28000,
    candidatos_activos: 1,
    estatus: 'Cerrada',
    es_delicada: false,
    cobro_cliente: 48000,
  },
  {
    id: 'v6',
    titulo_puesto: 'Coordinador de Logística Nocturna',
    empresa: 'Grupo Seguridad del Norte',
    tipo_jornada: 'Ciclico',
    detalle_turno: '12x12',
    modalidad: 'Presencial',
    ubicacion: 'Polanco, CDMX',
    sueldo_candidato: 21000,
    candidatos_activos: 0,
    estatus: 'Cerrada',
    es_delicada: false,
    cobro_cliente: 36000,
  },
];

export const CONTRATOS_MES_FREELANCE = [
  { id: 'c1', candidato: 'Héctor Salinas',     vacante: 'Guardia de Seguridad Intramuros', fecha_contrato: '2026-07-02', comision_freelance: 2500 },
  { id: 'c2', candidato: 'Mónica Aguilar',     vacante: 'Guardia de Seguridad Intramuros', fecha_contrato: '2026-07-05', comision_freelance: 2500 },
  { id: 'c3', candidato: 'Javier Cordero',     vacante: 'Supervisor de Turno',            fecha_contrato: '2026-07-08', comision_freelance: 4200 },
  { id: 'c4', candidato: 'Patricia León',      vacante: 'Guardia Rondín (Nocturno)',      fecha_contrato: '2026-07-11', comision_freelance: 3000 },
  { id: 'c5', candidato: 'Andrés Bermúdez',    vacante: 'Guardia de Seguridad Intramuros', fecha_contrato: '2026-07-14', comision_freelance: 2500 },
  { id: 'c6', candidato: 'Verónica Salas',     vacante: 'Supervisor de Turno',            fecha_contrato: '2026-07-16', comision_freelance: 4200 },
  { id: 'c7', candidato: 'Iván Tovar',         vacante: 'Guardia de Seguridad Intramuros', fecha_contrato: '2026-07-18', comision_freelance: 2500 },
];

export const COORDINADORES_DEMO = [
  { id: 'usr-coord-1', nombre_completo: 'María José Hernández' },
  { id: 'usr-coord-2', nombre_completo: 'Luis Alberto Ramírez' },
  { id: 'usr-coord-3', nombre_completo: 'Fernanda Castro' },
];

export const MODALIDADES = ['Presencial', 'Remoto', 'Híbrido'];

/**
 * Datos demo para el widget de Proyección Financiera
 * (visible SOLO para Super_Admin en el dashboard).
 *
 * En producción estos totales se calculan con una query SQL así:
 *
 *   SELECT
 *     COUNT(*) FILTER (WHERE vc.estatus = 'Contratado')            AS contratados,
 *     SUM(v.comision_freelance) FILTER (WHERE vc.estatus = 'Contratado') AS comisiones,
 *     SUM(v.cobro_cliente)        FILTER (WHERE vc.estatus = 'Contratado') AS facturacion
 *   FROM vacante_candidatos vc
 *   JOIN vacantes v ON v.id = vc.vacante_id
 *   WHERE v.workspace_id = $1
 *     AND vc.estatus = 'Contratado'
 *     AND date_trunc('month', vc.updated_at) = date_trunc('month', now());
 */
export const PROYECCION_FINANCIERA_DEMO = {
  mes_actual: 'Julio 2026',
  total_contratados_mes: 12,
  total_comisiones_mes: 32400,
  total_facturacion_mes: 433000,
  ticket_promedio_facturacion: 36083,
  comision_por_contratado: 2700,
  por_vacante: [
    {
      id: 'v1',
      titulo: 'Guardia de Seguridad Intramuros',
      contratados:      5,
      comision_total:   12500,
      facturacion_total: 110000,
    },
    {
      id: 'v3',
      titulo: 'Supervisor de Turno',
      contratados:      3,
      comision_total:   12600,
      facturacion_total: 165000,
    },
    {
      id: 'v2',
      titulo: 'Guardia Rondín (Nocturno)',
      contratados:      2,
      comision_total:   6000,
      facturacion_total: 88000,
    },
    {
      id: 'v4',
      titulo: 'Auxiliar de Monitoreo CCTV',
      contratados:      2,
      comision_total:   1300,
      facturacion_total: 70000,
    },
  ],
};

/**
 * Lista corta de giros que el formulario muestra.
 * (El enum completo en BD es más extenso para futuras industrias.)
 */
export const GIROS_FORM = [
  { value: 'Seguridad_Privada', label: 'Seguridad Privada' },
  { value: 'Logistica',         label: 'CEDIS' },
  { value: 'Retail',            label: 'Retail' },
  { value: 'Otro',              label: 'Otro' },
];