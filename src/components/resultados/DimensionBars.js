'use client';

import LikertBlockChart from './LikertBlockChart';

/**
 * DimensionBars — wrapper de compatibilidad para la página
 * de Resultados de Integridad. Reutiliza LikertBlockChart.
 *
 * (Este componente existe para preservar la API usada por
 * /resultados/[id] sin necesidad de reescribirla.)
 */
export default function DimensionBars({ data }) {
  return (
    <LikertBlockChart
      data={data}
      codigo="INT-01"
      titulo="Integridad Organizacional — 18 dimensiones"
      subtitulo="La dimensión 7 (Honestidad y Confiabilidad) tiene doble peso."
      gradient="from-brand-700 via-brand-600 to-accent-500"
      mostrarPeso
    />
  );
}