/**
 * SemaforoBadge — clasificador visual Verde / Amarillo / Rojo
 * según el puntaje (0-100).
 *
 * Reglas (estándar psicométrico):
 *   ≥ 75% → Óptimo (Verde)
 *   40-74% → Precaución (Amarillo)
 *   < 40% → Riesgo (Rojo)
 */

export function clasificarPorPercent(percent) {
  if (percent >= 75) return { tono: 'verde',    label: 'Óptimo',   color: 'emerald' };
  if (percent >= 40) return { tono: 'amarillo', label: 'Precaución', color: 'amber'  };
  return                       { tono: 'rojo',    label: 'Riesgo',   color: 'rose'   };
}

export function baremoToSemaforo(baremo) {
  switch (baremo) {
    case 'Bajo':     return { tono: 'rojo',    label: 'Bajo',     color: 'rose'    };
    case 'Medio':    return { tono: 'amarillo', label: 'Medio',    color: 'amber'   };
    case 'Alto':     return { tono: 'verde',    label: 'Alto',     color: 'emerald' };
    case 'Muy Alto': return { tono: 'verde',    label: 'Muy Alto', color: 'emerald' };
    default:         return { tono: 'gris',     label: 'N/A',      color: 'slate'   };
  }
}

const TONE_STYLES = {
  verde:    'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amarillo: 'bg-amber-50 text-amber-700 ring-amber-200',
  rojo:     'bg-rose-50 text-rose-700 ring-rose-200',
  gris:     'bg-slate-100 text-slate-600 ring-slate-200',
};

const TONE_DOT = {
  verde:    'bg-emerald-500',
  amarillo: 'bg-amber-500',
  rojo:     'bg-rose-500',
  gris:     'bg-slate-400',
};

export default function SemaforoBadge({ percent, baremo, className = '', showPercent = true }) {
  let info;
  if (baremo) info = baremoToSemaforo(baremo);
  else        info = clasificarPorPercent(percent ?? 0);

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1',
        TONE_STYLES[info.tono],
        className,
      ].join(' ')}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[info.tono]}`} />
      {info.label}
      {showPercent && percent != null && (
        <span className="font-mono opacity-75">· {Math.round(percent)}%</span>
      )}
    </span>
  );
}