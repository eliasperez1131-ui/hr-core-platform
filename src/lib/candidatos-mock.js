/**
 * Mock de historial de candidato para la pantalla de
 * deduplicación (/registrar-candidato).
 *
 * Cuando un reclutador busca por correo o teléfono y el
 * candidato ya existe, este objeto alimenta el modal
 * "Historial del Candidato".
 */

export const HISTORIAL_DEMO = {
  candidato: {
    id: 'cand-existente-001',
    nombre_completo: 'Roberto Quintero Saavedra',
    correo: 'roberto.quintero@gmail.com',
    telefono: '+52 55 1234 5678',
    edad: 31,
    escolaridad: 'Preparatoria',
    estado: 'CDMX',
    municipio: 'Iztapalapa',
    vacantes_participadas: 4,
    inasistencias: 2,
    abandonos: 1,
    created_at: '2025-09-12T10:30:00Z',
  },
  historial: [
    {
      id: 'h1',
      vacante: 'Guardia de Seguridad Intramuros',
      empresa: 'Grupo Seguridad del Norte',
      estatus: 'No Apto',
      puntuacion: 62,
      asistido: false,
      fecha: '2026-05-08T14:00:00Z',
      observaciones: 'No cumple requisitos de integridad.',
    },
    {
      id: 'h2',
      vacante: 'Auxiliar de Almacén CEDIS',
      empresa: 'Grupo Seguridad del Norte',
      estatus: 'Abandono',
      puntuacion: 71,
      asistido: true,
      fecha: '2026-03-22T09:00:00Z',
      observaciones: 'No se presentó al 2do día de capacitación.',
    },
    {
      id: 'h3',
      vacante: 'Guardia Rondín (Nocturno)',
      empresa: 'Grupo Seguridad del Norte',
      estatus: 'Inasistencia',
      puntuacion: 78,
      asistido: false,
      fecha: '2026-01-15T22:00:00Z',
      observaciones: 'No se presentó a la entrevista final.',
    },
    {
      id: 'h4',
      vacante: 'Supervisor de Turno',
      empresa: 'Grupo Seguridad del Norte',
      estatus: 'Rechazado',
      puntuacion: 68,
      asistido: true,
      fecha: '2025-11-04T16:00:00Z',
      observaciones: 'Perfil no alineado al puesto.',
    },
  ],
};

/**
 * Para probar la deduplicación desde la página demo,
 * estos son los correos y teléfonos que devolverán match.
 */
export const DEDUPE_DEMO_KEYS = {
  correos:   ['roberto.quintero@gmail.com', 'javier.cordero@outlook.com'],
  telefonos: ['+52 55 1234 5678', '+52 55 4422 8831'],
};