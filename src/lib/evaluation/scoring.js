/**
 * ============================================================
 *  Algoritmo de Calificación — Multi-Batería
 * ============================================================
 *
 *  Detecta automáticamente el tipo de reactivo por su estructura:
 *
 *   - LIKERT_BLOQUE (Integridad / Motivadores / Liderazgo / Ventas / Trato)
 *       → { id, dimension, isInverted, weight }
 *       Likert 1..5 (con inversión y pesos)
 *       Pesos: 1 por defecto; Integridad dim 7 con peso 2.
 *
 *   - COGNITIVO   → { id, bloque, opciones, respuestaCorrecta }
 *                    1 punto si elige la respuestaCorrecta, 0 si no
 *
 *   - DISC        → { id, eje ∈ {D,I,S,C}, opciones: ['Más','Menos'] }
 *                    +1 al eje si marca 'Más', 0 si 'Menos'
 *
 *  Cada bloque retorna una estructura rica con detalle por dimensión /
 *  bloque / eje, lista para graficar.
 * ============================================================
 */

import {
  INTEGRIDAD_REACTIVOS,
  COGNITIVO_REACTIVOS,
  DISC_REACTIVOS,
  DISC_META,
  MOTIVADORES_REACTIVOS,
  LIDERAZGO_REACTIVOS,
  VENTAS_REACTIVOS,
  TRATO_CLIENTE_REACTIVOS,
} from './master-data';

export const LIKERT_MIN = 1;
export const LIKERT_MAX = 5;

/* ============================================================
 *  Helpers comunes
 * ============================================================ */

export function baremoFromPercent(percent) {
  if (percent < 40) return 'Bajo';
  if (percent < 65) return 'Medio';
  if (percent < 85) return 'Alto';
  return 'Muy Alto';
}

export function percentToAdjusted(percent) {
  return Math.max(1, Math.round((percent / 100) * 9 + 1));
}

export function baremoToColor(baremo) {
  switch (baremo) {
    case 'Bajo':     return { ring: 'ring-rose-300',    bg: 'bg-rose-50',    text: 'text-rose-700'    };
    case 'Medio':    return { ring: 'ring-amber-300',   bg: 'bg-amber-50',   text: 'text-amber-700'   };
    case 'Alto':     return { ring: 'ring-sky-300',     bg: 'bg-sky-50',     text: 'text-sky-700'     };
    case 'Muy Alto': return { ring: 'ring-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-700' };
    default:         return { ring: 'ring-slate-200',   bg: 'bg-slate-50',   text: 'text-slate-600'   };
  }
}

/* ============================================================
 *  Detector de tipo de reactivo
 * ============================================================ */
function detectTipo(reactivo) {
  if ('isInverted' in reactivo && 'dimension' in reactivo) return 'integridad';
  if ('respuestaCorrecta' in reactivo) return 'cognitivo';
  if ('eje' in reactivo) return 'disc';
  return 'desconocido';
}

/* ============================================================
 *  LIKERT GENÉRICO — Likert 1-5 con inversión y pesos
 *  Usado por: Integridad, Motivadores, Liderazgo, Ventas, Trato
 * ============================================================ */
export function normalizeLikert(rawValue, isInverted) {
  if (rawValue == null) return null;
  if (rawValue < LIKERT_MIN || rawValue > LIKERT_MAX) return null;
  return isInverted ? (LIKERT_MAX + 1) - rawValue : rawValue;
}

/**
 * Motor genérico: recibe un array de reactivos likert (cualquier bloque)
 * y devuelve el puntaje total, percentil, baremo y desglose por dimensión.
 *
 * Funciona con cualquier array de la forma:
 *   { id, dimension, isInverted, weight }
 *
 * @param {Array}  reactivos  - array de reactivos del bloque
 * @param {Object} respuestas - { [id]: 1|2|3|4|5 }
 * @param {string} tipo       - etiqueta del bloque (integridad, motivadores, etc.)
 * @returns {Object} reporte con total, max, percent, baremo, por_dimension
 */
export function calculateLikertBloque(reactivos, respuestas = {}, tipo = 'likert') {
  let total = 0;
  let max = 0;
  let respondidas = 0;
  const dimMap = new Map();

  for (const r of reactivos) {
    const raw = respuestas[r.id];
    if (raw == null) continue;
    const valor = normalizeLikert(raw, r.isInverted);
    if (valor == null) continue;

    const puntos    = valor * (r.weight || 1);
    const puntosMax = LIKERT_MAX * (r.weight || 1);

    total += puntos;
    max += puntosMax;
    respondidas++;

    if (!dimMap.has(r.dimension)) {
      dimMap.set(r.dimension, { puntos: 0, max: 0, count: 0, weight_total: 0 });
    }
    const acc = dimMap.get(r.dimension);
    acc.puntos += puntos;
    acc.max += puntosMax;
    acc.count += 1;
    acc.weight_total += (r.weight || 1);
  }

  const percent = max > 0 ? (total / max) * 100 : 0;
  const percent_ajustado = percentToAdjusted(percent);

  const por_dimension = Array.from(dimMap.entries())
    .map(([dimension, v]) => {
      const p = v.max > 0 ? (v.puntos / v.max) * 100 : 0;
      return {
        dimension,
        puntos: v.puntos,
        max:    v.max,
        count:  v.count,
        weight_total: v.weight_total,
        percent: p,
        nivel:  baremoFromPercent(p),
      };
    })
    .sort((a, b) => a.percent - b.percent);

  return {
    tipo,
    total,
    max,
    percent: Math.round(percent * 10) / 10,
    percent_ajustado,
    baremo: baremoFromPercent(percent),
    respondidas,
    faltantes: reactivos.length - respondidas,
    por_dimension,
  };
}

/* ============================================================
 *  Wrappers por bloque (mantienen la firma original)
 * ============================================================ */
export function calculateIntegridad(respuestas = {}) {
  return calculateLikertBloque(INTEGRIDAD_REACTIVOS, respuestas, 'integridad');
}

export function calculateMotivadores(respuestas = {}) {
  return calculateLikertBloque(MOTIVADORES_REACTIVOS, respuestas, 'motivadores');
}

export function calculateLiderazgo(respuestas = {}) {
  return calculateLikertBloque(LIDERAZGO_REACTIVOS, respuestas, 'liderazgo');
}

export function calculateVentas(respuestas = {}) {
  return calculateLikertBloque(VENTAS_REACTIVOS, respuestas, 'ventas');
}

export function calculateTratoCliente(respuestas = {}) {
  return calculateLikertBloque(TRATO_CLIENTE_REACTIVOS, respuestas, 'trato_cliente');
}

/* ============================================================
 *  COGNITIVO — Opción múltiple con respuestaCorrecta
 * ============================================================ */
export function calculateCognitivo(respuestas = {}) {
  let aciertos = 0;
  let respondidas = 0;
  const bloqueMap = new Map();

  for (const r of COGNITIVO_REACTIVOS) {
    const resp = respuestas[r.id];
    const contestado = resp != null;

    if (!bloqueMap.has(r.bloque)) {
      bloqueMap.set(r.bloque, { total: 0, aciertos: 0, respondidas: 0, reactivos: [] });
    }
    const acc = bloqueMap.get(r.bloque);
    acc.total += 1;

    let acierto = false;
    if (contestado) {
      respondidas++;
      acc.respondidas++;
      if (resp === r.respuestaCorrecta) {
        acierto = true;
        aciertos++;
        aciertos; // (placeholder readability)
        acc.aciertos++;
      }
    }
    acc.reactivos.push({
      id: r.id,
      bloque: r.bloque,
      reactivo: r.reactivo,
      opciones: r.opciones,
      respuestaCorrecta: r.respuestaCorrecta,
      respuestaCandidato: resp ?? null,
      acierto,
    });
  }

  const totalReactivos = COGNITIVO_REACTIVOS.length;
  const percent = totalReactivos > 0 ? (aciertos / totalReactivos) * 100 : 0;

  const por_bloque = Array.from(bloqueMap.entries()).map(([bloque, v]) => ({
    bloque,
    total: v.total,
    aciertos: v.aciertos,
    respondidas: v.respondidas,
    percent: v.total > 0 ? (v.aciertos / v.total) * 100 : 0,
    nivel: baremoFromPercent(v.total > 0 ? (v.aciertos / v.total) * 100 : 0),
  }));

  return {
    tipo: 'cognitivo',
    aciertos,
    total: totalReactivos,
    respondidas,
    percent: Math.round(percent * 10) / 10,
    percent_ajustado: percentToAdjusted(percent),
    baremo: baremoFromPercent(percent),
    por_bloque,
    detalle: Array.from(bloqueMap.values()).flatMap((v) => v.reactivos),
  };
}

/* ============================================================
 *  DISC — Frecuencia por eje (Más = +1, Menos = 0)
 * ============================================================ */
export function calculateDISC(respuestas = {}) {
  const ejes = ['D', 'I', 'S', 'C'];
  const totals = Object.fromEntries(ejes.map((e) => [e, 0]));
  const maxPorEje = Object.fromEntries(ejes.map((e) => [e, 0]));
  const respondidasPorEje = Object.fromEntries(ejes.map((e) => [e, 0]));

  for (const r of DISC_REACTIVOS) {
    maxPorEje[r.eje] += 1;
    const resp = respuestas[r.id];
    if (resp == null) continue;

    respondidasPorEje[r.eje] += 1;
    if (typeof resp === 'string' && resp.toLowerCase() === 'más') {
      totals[r.eje] += 1;
    } else if (resp === 1 || resp === '1' || resp === true) {
      // Soporte numérico 0/1 por si el form lo manda así
      totals[r.eje] += resp;
    }
  }

  const totalReactivos = DISC_REACTIVOS.length;
  const totalMas = ejes.reduce((acc, e) => acc + totals[e], 0);

  const por_eje = ejes.map((e) => {
    const max   = maxPorEje[e];
    const valor = totals[e];
    const percent = max > 0 ? (valor / max) * 100 : 0;
    return {
      eje: e,
      nombre: DISC_META.ejes[e].nombre,
      descripcion: DISC_META.ejes[e].descripcion,
      valor,
      max,
      respondidas: respondidasPorEje[e],
      percent: Math.round(percent * 10) / 10,
      nivel: valor >= 4 ? 'Alto' : valor >= 2 ? 'Medio' : 'Bajo',
    };
  });

  return {
    tipo: 'disc',
    por_eje,
    ejes,
    totals,
    total_mas: totalMas,
    total_reactivos: totalReactivos,
  };
}

/* ============================================================
 *  Función maestra — recibe respuestas de TODAS las pruebas
 *  y devuelve un reporte unificado.
 * ============================================================ */
export function calculateMasterScore({
  integridad    = {},
  motivadores   = {},
  liderazgo     = {},
  ventas        = {},
  trato_cliente = {},
  cognitivo     = {},
  disc          = {},
} = {}) {
  return {
    integridad,
    motivadores:   calculateMotivadores(motivadores),
    liderazgo:     calculateLiderazgo(liderazgo),
    ventas:        calculateVentas(ventas),
    trato_cliente: calculateTratoCliente(trato_cliente),
    cognitivo,
    disc,
    generated_at:  new Date().toISOString(),
  };
}

/* ============================================================
 *  Re-export del tipo de reactivo (helper para los engines)
 * ============================================================ */
export { detectTipo };

/* ============================================================
 *  Backward-compat: calculateScore() aplicado a un array genérico
 *  Detecta automáticamente el tipo.
 * ============================================================ */
export function calculateScore(respuestas = {}, reactivos = []) {
  if (!reactivos || reactivos.length === 0) {
    return { tipo: 'vacio', total: 0, max: 0, percent: 0 };
  }
  const tipo = detectTipo(reactivos[0]);
  if (tipo === 'integridad') {
    return {
      tipo,
      total: 0, max: 0, percent: 0,
      ...calculateIntegridad(respuestas),
    };
  }
  if (tipo === 'cognitivo') {
    return calculateCognitivo(respuestas);
  }
  if (tipo === 'disc') {
    return calculateDISC(respuestas);
  }
  return { tipo, error: 'Tipo de reactivo no soportado.' };
}

/* ============================================================
 *  Helper para resolver un nombre de bloque → { reactivos, calc }
 *  usado por /resultados/[id] para iterar dinámicamente.
 * ============================================================ */
export const BLOQUES_LIKERT = {
  integridad:    { codigo: 'INT-01', nombre: 'Integridad Organizacional',    calc: calculateIntegridad,    reactivos: INTEGRIDAD_REACTIVOS,    gradient: 'from-brand-700 via-brand-600 to-accent-500' },
  motivadores:   { codigo: 'MOT-01', nombre: 'Motivadores y Estilo',         calc: calculateMotivadores,   reactivos: MOTIVADORES_REACTIVOS,   gradient: 'from-amber-700 via-orange-600 to-rose-500' },
  liderazgo:     { codigo: 'LID-01', nombre: 'Liderazgo y Decisiones',        calc: calculateLiderazgo,     reactivos: LIDERAZGO_REACTIVOS,     gradient: 'from-indigo-700 via-blue-600 to-cyan-500' },
  ventas:        { codigo: 'VEN-01', nombre: 'Ventas y Negociación',          calc: calculateVentas,        reactivos: VENTAS_REACTIVOS,        gradient: 'from-rose-700 via-pink-600 to-fuchsia-500' },
  trato_cliente: { codigo: 'TC-01',  nombre: 'Trato al Cliente',              calc: calculateTratoCliente,  reactivos: TRATO_CLIENTE_REACTIVOS, gradient: 'from-teal-700 via-emerald-600 to-green-500' },
};