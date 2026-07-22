/**
 * Genera respuestas demo realistas para previsualizar la página
 * de resultados sin necesidad de tener Supabase poblado.
 *
 * En producción, estas respuestas se leen de la BD
 * (tabla `vacante_candidatos` + futuras tablas de evaluaciones).
 */
import {
  INTEGRIDAD_REACTIVOS,
  COGNITIVO_REACTIVOS,
  DISC_REACTIVOS,
  MOTIVADORES_REACTIVOS,
  LIDERAZGO_REACTIVOS,
  VENTAS_REACTIVOS,
  TRATO_CLIENTE_REACTIVOS,
} from './master-data';

/**
 * Perfil demo: candidato "mixto-alto" (perfil de ventas).
 *  - Integridad     ~78% (mayoría 4, algunas invertidas en 2)
 *  - Cognitivo      ~80% (24/30 correctas)
 *  - DISC           I+D alto, S+C medio
 *  - Motivadores    búsqueda de retos, autonomía alta
 *  - Liderazgo      delegación, estratégico
 *  - Ventas         empuje + resiliencia altos
 *  - Trato Cliente  empatía + paciencia altas
 */
export function generateDemoRespuestas() {
  const integridad = {};
  for (const r of INTEGRIDAD_REACTIVOS) {
    const r1 = Math.random();
    let v;
    if (r1 < 0.70) v = 4;
    else if (r1 < 0.85) v = 3;
    else if (r1 < 0.95) v = 5;
    else v = 2;
    integridad[r.id] = v;
  }

  const cognitivo = {};
  for (const r of COGNITIVO_REACTIVOS) {
    if (Math.random() < 0.80) {
      cognitivo[r.id] = r.respuestaCorrecta;
    } else {
      const wrong = [0, 1, 2, 3].filter((i) => i !== r.respuestaCorrecta);
      cognitivo[r.id] = wrong[Math.floor(Math.random() * wrong.length)];
    }
  }

  const disc = {};
  for (const r of DISC_REACTIVOS) {
    disc[r.id] = Math.random() < 0.70 ? 'Más' : 'Menos';
  }

  // Para los 4 nuevos bloques likert: distribución aleatoria
  // ligeramente superior (perfil de candidato "bueno")
  const motivadores = {};
  for (const r of MOTIVADORES_REACTIVOS) {
    motivadores[r.id] = [3, 4, 4, 4, 5, 5][Math.floor(Math.random() * 6)];
  }

  const liderazgo = {};
  for (const r of LIDERAZGO_REACTIVOS) {
    liderazgo[r.id] = [3, 4, 4, 4, 5, 5][Math.floor(Math.random() * 6)];
  }

  const ventas = {};
  for (const r of VENTAS_REACTIVOS) {
    ventas[r.id] = [3, 4, 4, 4, 5, 5][Math.floor(Math.random() * 6)];
  }

  const trato_cliente = {};
  for (const r of TRATO_CLIENTE_REACTIVOS) {
    trato_cliente[r.id] = [3, 4, 4, 4, 5, 5][Math.floor(Math.random() * 6)];
  }

  return {
    integridad,
    motivadores,
    liderazgo,
    ventas,
    trato_cliente,
    cognitivo,
    disc,
  };
}

/**
 * Genera respuestas demo para un solo bloque likert.
 * Útil para previsualizar el detalle de un solo bloque.
 */
export function generateDemoLikert(reactivos) {
  const out = {};
  for (const r of reactivos) {
    out[r.id] = [3, 4, 4, 4, 5, 5][Math.floor(Math.random() * 6)];
  }
  return out;
}

export const DEMO_CANDIDATOS = {
  'demo':  { id: 'demo',  nombre_completo: 'Candidato Demo' },
  'demo1': { id: 'demo1', nombre_completo: 'Ana Reyes Hernández' },
  'demo2': { id: 'demo2', nombre_completo: 'Carlos Méndez Ruiz' },
  'demo3': { id: 'demo3', nombre_completo: 'Lucía Torres Vega' },
  'demo4': { id: 'demo4', nombre_completo: 'Miguel Núñez Pérez' },
};