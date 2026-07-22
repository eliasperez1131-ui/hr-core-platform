/**
 * Lógica del Selector Inteligente de Turnos.
 *
 * Mapeo simplificado:
 *   - Seguridad Privada → ['24x24', '12x12', 'Otro']
 *   - CEDIS / Retail     → ['Matutino', 'Vespertino', 'Nocturno', 'Rola Turnos', 'Otro']
 *   - Otro               → ['Personalizado']
 *
 * Cuando el usuario selecciona "Otro" / "Personalizado", debe aparecer
 * un input libre (en VacanteForm.js) para escribir el ciclo personalizado.
 *
 * El tipo_jornada (Fijo / Rolado / Ciclico) se infiere automáticamente
 * según el detalle_turno elegido y se guarda en la BD.
 */

export const OPCION_OTRO = 'Otro';

/**
 * Opciones visibles por cada giro.
 * `value` = lo que se guarda en `vacantes.detalle_turno`.
 * `tipo`  = tipo_jornada derivado.
 */
export const TURNOS_POR_GIRO = {
  Seguridad_Privada: {
    label: 'Seguridad Privada',
    descripcion: 'Patrones cíclicos típicos para guardias intramuros y rondines.',
    opciones: [
      { value: '24x24',     tipo: 'Ciclico', descripcion: '24 horas trabajadas por 24 de descanso.' },
      { value: '12x12',     tipo: 'Ciclico', descripcion: '12 horas trabajadas por 12 de descanso.' },
      { value: OPCION_OTRO, tipo: 'Otro',   descripcion: 'Especificar un ciclo personalizado.' },
    ],
  },

  Logistica: {
    label: 'CEDIS',
    descripcion: 'Operación logística: almacenes, distribución, última milla.',
    opciones: [
      { value: 'Matutino',    tipo: 'Fijo',   descripcion: 'Turno fijo de mañana.' },
      { value: 'Vespertino',  tipo: 'Fijo',   descripcion: 'Turno fijo de tarde.' },
      { value: 'Nocturno',    tipo: 'Fijo',   descripcion: 'Turno fijo de noche.' },
      { value: 'Rola Turnos', tipo: 'Rolado', descripcion: 'Rotación continua entre los turnos anteriores.' },
      { value: OPCION_OTRO,  tipo: 'Otro',   descripcion: 'Especificar un ciclo personalizado.' },
    ],
  },

  Retail: {
    label: 'Retail',
    descripcion: 'Tiendas, autoservicio y comercio con horarios estables.',
    opciones: [
      { value: 'Matutino',    tipo: 'Fijo',   descripcion: 'Turno fijo de mañana.' },
      { value: 'Vespertino',  tipo: 'Fijo',   descripcion: 'Turno fijo de tarde.' },
      { value: 'Nocturno',    tipo: 'Fijo',   descripcion: 'Turno fijo de noche.' },
      { value: 'Rola Turnos', tipo: 'Rolado', descripcion: 'Rotación continua entre los turnos anteriores.' },
      { value: OPCION_OTRO,  tipo: 'Otro',   descripcion: 'Especificar un ciclo personalizado.' },
    ],
  },

  Otro: {
    label: 'Otro',
    descripcion: 'Giro no listado — define un horario personalizado.',
    opciones: [
      { value: 'Personalizado', tipo: 'Fijo', descripcion: 'Define el ciclo en el campo de texto.' },
    ],
  },
};

/**
 * Lista de giros que ve el usuario en el Select.
 * `value` = enum que va a BD.
 * `label` = lo que se muestra.
 *
 * NOTA: 'Logistica' es el valor interno en la BD pero se muestra
 * como 'CEDIS' (más comercial).
 */
export const GIROS_FORM = [
  { value: 'Seguridad_Privada', label: 'Seguridad Privada' },
  { value: 'Logistica',         label: 'CEDIS' },
  { value: 'Retail',            label: 'Retail' },
  { value: 'Otro',              label: 'Otro' },
];

/**
 * Devuelve la lista de opciones de turno para un giro.
 */
export function getOpcionesTurno(giro) {
  return TURNOS_POR_GIRO[giro]?.opciones || TURNOS_POR_GIRO.Otro.opciones;
}

/**
 * Devuelve la metadata (label + descripción) de un giro.
 */
export function getGiroMeta(giro) {
  return TURNOS_POR_GIRO[giro] || TURNOS_POR_GIRO.Otro;
}

/**
 * Sugerencia inicial para un giro recién seleccionado.
 */
export function getJornadaSugerida(giro) {
  const meta = getGiroMeta(giro);
  const first = meta.opciones[0];
  return {
    tipo_jornada:   first.tipo,
    detalle_turno:  first.value,
    descripcion:    meta.descripcion,
  };
}

/**
 * Devuelve la opción específica de un (giro, detalle_turno).
 * Si no existe, retorna null.
 */
export function findOpcionTurno(giro, detalle_turno) {
  const opciones = getOpcionesTurno(giro);
  return opciones.find((o) => o.value === detalle_turno) || null;
}