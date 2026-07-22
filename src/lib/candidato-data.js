/**
 * ============================================================
 *  Datos del Candidato + Resultado de Evaluación
 * ============================================================
 *
 *  Capa de abstracción para que la página /candidato/[id] funcione
 *  tanto en modo DEMO (sin Supabase) como en producción.
 */

import {
  calculateMasterScore,
} from '@/lib/evaluation/scoring';
import {
  generateDemoRespuestas,
  DEMO_CANDIDATOS,
} from '@/lib/evaluation/demo-data';

export const DEMO_CANDIDATOS_FULL = {
  'demo1': {
    id: 'demo1',
    nombre_completo: 'Ana Reyes Hernández',
    correo:          'ana.reyes@gmail.com',
    telefono:        '+52 55 4422 8831',
    edad:            28,
    escolaridad:     'Licenciatura en Psicología',
    estado:          'CDMX',
    municipio:       'Benito Juárez',
    url_cv_pdf:      null,
    consentimiento_red: true,
    vacantes_participadas: 5,
    inasistencias: 0,
    abandonos: 0,
    estatus_reclutamiento: 'Completada',
    created_at: '2025-08-10T12:00:00Z',
  },
  'demo2': {
    id: 'demo2',
    nombre_completo: 'Carlos Méndez Ruiz',
    correo:          'carlos.mendez@outlook.com',
    telefono:        '+52 55 1234 5678',
    edad:            35,
    escolaridad:     'Ingeniería Industrial',
    estado:          'Edo. México',
    municipio:       'Naucalpan',
    url_cv_pdf:      null,
    consentimiento_red: true,
    vacantes_participadas: 8,
    inasistencias: 1,
    abandonos: 1,
    estatus_reclutamiento: 'En_Progreso',
    created_at: '2025-10-04T09:30:00Z',
  },
  'demo3': {
    id: 'demo3',
    nombre_completo: 'Lucía Torres Vega',
    correo:          'lucia.torres@gmail.com',
    telefono:        '+52 55 9876 5432',
    edad:            26,
    escolaridad:     'Técnico en Seguridad',
    estado:          'Jalisco',
    municipio:       'Guadalajara',
    url_cv_pdf:      null,
    consentimiento_red: true,
    vacantes_participadas: 3,
    inasistencias: 0,
    abandonos: 0,
    estatus_reclutamiento: 'Pendiente',
    created_at: '2026-01-15T14:20:00Z',
  },
};

/**
 * Genera un candidato demo determinístico según el id.
 * Si no hay match, retorna un placeholder.
 */
export function getDemoCandidato(id) {
  if (DEMO_CANDIDATOS_FULL[id]) return DEMO_CANDIDATOS_FULL[id];
  if (DEMO_CANDIDATOS[id]) return { ...DEMO_CANDIDATOS[id], edad: null, escolaridad: null, estado: null, municipio: null };
  return {
    id,
    nombre_completo: 'Candidato Demo',
    correo:          'demo@example.com',
    telefono:        '+52 55 0000 0000',
    edad:            30,
    escolaridad:     'Licenciatura',
    estado:          'CDMX',
    municipio:       'Benito Juárez',
    url_cv_pdf:      null,
    consentimiento_red: true,
    vacantes_participadas: 0,
    inasistencias: 0,
    abandonos: 0,
    estatus_reclutamiento: 'Pendiente',
    created_at: new Date().toISOString(),
  };
}

/**
 * Genera el reporte maestro con respuestas determinísticas según el id.
 * (Distintos candidatos dan distintos resultados de demo.)
 */
export function getDemoResultado(id) {
  // Variamos la semilla según el id para tener resultados distintos
  const seed = id || 'demo';

  // Generamos respuestas y las mutamos determinísticamente según el seed
  const respuestas = generateDemoRespuestas();

  // Modificadores: algunos candidatos son "mejores" que otros
  const modifiers = {
    'demo1': { integridad: +5, cognitivo: +5, disc_i: +2 },  // Top candidate
    'demo2': { integridad: -10, cognitivo: 0, disc_d: +3 }, // Promedio con áreas a mejorar
    'demo3': { integridad: +10, cognitivo: -15, disc_s: +3 }, // Honestidad alta, cognitivo bajo
    'demo':  { integridad: 0, cognitivo: 0, disc: 0 },
  };
  const mod = modifiers[seed] || {};

  // Aplicar modificadores: ajustamos valores de integridad sumando uniformemente
  if (mod.integridad) {
    for (const id of Object.keys(respuestas.integridad)) {
      const actual = respuestas.integridad[id];
      const nuevo  = Math.max(1, Math.min(5, actual + (mod.integridad / 10)));
      respuestas.integridad[id] = Math.round(nuevo);
    }
  }

  return calculateMasterScore(respuestas);
}

/**
 * Determina el puesto (vacante) al que aplica el candidato demo.
 */
export const VACANTE_DEMO_POR_CANDIDATO = {
  'demo1': {
    id: 'v1',
    titulo: 'Guardia de Seguridad Intramuros',
    empresa: 'Grupo Seguridad del Norte S.A. de C.V.',
    tipo_jornada: 'Ciclico',
    detalle_turno: '24x24',
    modalidad: 'Presencial',
    ubicacion: 'Santa Fe, CDMX',
    sueldo_candidato: 12500,
  },
  'demo2': {
    id: 'v3',
    titulo: 'Supervisor de Turno',
    empresa: 'Grupo Seguridad del Norte S.A. de C.V.',
    tipo_jornada: 'Rolado',
    detalle_turno: '4x4',
    modalidad: 'Presencial',
    ubicacion: 'Tlalnepantla, Edo. Méx.',
    sueldo_candidato: 18500,
  },
  'demo3': {
    id: 'v6',
    titulo: 'Ejecutiva de Ventas Tienda',
    empresa: 'Retail Plaza del Norte',
    tipo_jornada: 'Fijo',
    detalle_turno: 'Vespertino',
    modalidad: 'Presencial',
    ubicacion: 'Guadalajara, Jalisco',
    sueldo_candidato: 14200,
  },
  'demo': {
    id: 'v1',
    titulo: 'Vacante Demo',
    empresa: 'HR CORE Demo Workspace',
    tipo_jornada: 'Fijo',
    detalle_turno: 'Matutino',
    modalidad: 'Presencial',
    ubicacion: 'CDMX',
    sueldo_candidato: 12000,
  },
};

export function getVacanteDemo(id) {
  return VACANTE_DEMO_POR_CANDIDATO[id] || VACANTE_DEMO_POR_CANDIDATO.demo;
}

/**
 * Genera iniciales para avatar placeholder.
 */
export function getIniciales(nombre) {
  if (!nombre) return '?';
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}