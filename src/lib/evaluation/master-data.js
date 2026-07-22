/**
 * Wrapper JS sobre master-data.json.
 * Permite importar todo el banco con un único import.
 *
 * IMPORTANTE: los IDs de reactivo son LOCALES al tipo de prueba.
 *   - Integridad:  1..90
 *   - Cognitivo:   A1..A10, B1..B10, C1..C10
 *   - DISC:        D1..D6, I1..I6, S1..S6, C1..C6
 *   - Motivadores: MOT-1..MOT-12
 *   - Liderazgo:   LID-1..LID-12
 *   - Ventas:      VEN-1..VEN-12
 *   - Trato Cliente: TC-1..TC-12
 *
 * Si en algún caso necesitas fusionar respuestas en un solo mapa,
 * PREFIJAR las IDs por tipo (ej. "INT_1", "MOT_MOT-1", etc.).
 *
 * En Next.js los .json se importan nativamente:
 *   import data from './master-data.json';
 */
import master from './master-data.json';

export const BATERIA_VERSION     = master.version;
export const BATERIA_UPDATED     = master.updated_at;
export const BATERIA_METADATA    = master.metadata;

export const INTEGRIDAD_BLOQUE      = master.integridad;
export const COGNITIVO_BLOQUE       = master.cognitivo;
export const DISC_BLOQUE            = master.disc;
export const MOTIVADORES_BLOQUE     = master.motivadores;
export const LIDERAZGO_BLOQUE       = master.liderazgo;
export const VENTAS_BLOQUE          = master.ventas;
export const TRATO_CLIENTE_BLOQUE   = master.trato_cliente;

export const INTEGRIDAD_REACTIVOS   = INTEGRIDAD_BLOQUE.reactivos;
export const COGNITIVO_REACTIVOS    = COGNITIVO_BLOQUE.reactivos;
export const DISC_REACTIVOS         = DISC_BLOQUE.reactivos;
export const MOTIVADORES_REACTIVOS  = MOTIVADORES_BLOQUE.reactivos;
export const LIDERAZGO_REACTIVOS    = LIDERAZGO_BLOQUE.reactivos;
export const VENTAS_REACTIVOS       = VENTAS_BLOQUE.reactivos;
export const TRATO_CLIENTE_REACTIVOS = TRATO_CLIENTE_BLOQUE.reactivos;

export const INTEGRIDAD_META = {
  codigo:   INTEGRIDAD_BLOQUE.codigo,
  nombre:   INTEGRIDAD_BLOQUE.nombre,
  total:    INTEGRIDAD_BLOQUE.reactivos.length,
  escala:   INTEGRIDAD_BLOQUE.escala,
};

export const COGNITIVO_META = {
  codigo:   COGNITIVO_BLOQUE.codigo,
  nombre:   COGNITIVO_BLOQUE.nombre,
  total:    COGNITIVO_BLOQUE.reactivos.length,
  bloques:  Array.from(new Set(COGNITIVO_REACTIVOS.map((r) => r.bloque))),
};

export const DISC_META = {
  codigo:   DISC_BLOQUE.codigo,
  nombre:   DISC_BLOQUE.nombre,
  total:    DISC_BLOQUE.reactivos.length,
  ejes:     DISC_BLOQUE.ejes,
  opciones: DISC_BLOQUE.opciones,
};

export const MOTIVADORES_META = {
  codigo: MOTIVADORES_BLOQUE.codigo,
  nombre: MOTIVADORES_BLOQUE.nombre,
  total:  MOTIVADORES_BLOQUE.reactivos.length,
};

export const LIDERAZGO_META = {
  codigo: LIDERAZGO_BLOQUE.codigo,
  nombre: LIDERAZGO_BLOQUE.nombre,
  total:  LIDERAZGO_BLOQUE.reactivos.length,
};

export const VENTAS_META = {
  codigo: VENTAS_BLOQUE.codigo,
  nombre: VENTAS_BLOQUE.nombre,
  total:  VENTAS_BLOQUE.reactivos.length,
};

export const TRATO_CLIENTE_META = {
  codigo: TRATO_CLIENTE_BLOQUE.codigo,
  nombre: TRATO_CLIENTE_BLOQUE.nombre,
  total:  TRATO_CLIENTE_BLOQUE.reactivos.length,
};

export default master;