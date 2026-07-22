import { baremoFromPercent, baremoToColor } from '@/lib/evaluation/scoring';
import { formatMXN } from '@/lib/format';

/**
 * EvaluationResult — pantalla final con el resultado y desglose por dimensión.
 *
 * Props:
 *   result      -> el objeto devuelto por calculateScore
 *   candidato   -> { nombre_completo }
 *   onRestart() -> opcional
 */
export default function EvaluationResult({ result, candidato, onRestart }) {
  if (!result) return null;
  const colorGlobal = baremoToColor(result.baremo);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header con puntaje global */}
      <div className={['rounded-2xl ring-1 p-8 text-center', colorGlobal.bg, colorGlobal.ring].join(' ')}>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Resultado global
        </p>
        <p className={['mt-2 text-6xl font-extrabold tabular-nums', colorGlobal.text].join(' ')}>
          {result.percent_ajustado}<span className="text-2xl text-slate-400">/10</span>
        </p>
        <p className={['mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1', colorGlobal.ring, colorGlobal.text, 'bg-white/60'].join(' ')}>
          Nivel: {result.baremo}
        </p>
        {candidato?.nombre_completo && (
          <p className="mt-4 text-sm text-slate-700">
            Candidato: <strong>{candidato.nombre_completo}</strong>
          </p>
        )}
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <Mini label="Respondidas" value={result.respondidas} />
          <Mini label="Sin responder" value={result.faltantes} />
          <Mini label="Puntos" value={`${result.total} / ${result.max}`} />
        </div>
      </div>

      {/* Desglose por dimensión */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-ink-900">Desglose por dimensión</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ordenadas de mayor a menor nivel de integridad. La dimensión 7 (Honestidad y Confiabilidad) tiene doble peso.
          </p>
        </div>
        <ul className="divide-y divide-slate-100">
          {result.por_dimension.map((d) => {
            const c = baremoToColor(d.nivel);
            return (
              <li key={d.dimension} className="px-6 py-4 flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink-900">{d.dimension}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {d.count} reactivos · {d.puntos} / {d.max} puntos
                  </p>
                </div>
                <div className="flex-none w-32">
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={[
                        'h-full rounded-full',
                        d.nivel === 'Bajo' ? 'bg-rose-500' :
                        d.nivel === 'Medio' ? 'bg-amber-500' :
                        d.nivel === 'Alto' ? 'bg-sky-500' : 'bg-emerald-500',
                      ].join(' ')}
                      style={{ width: `${d.percent}%` }}
                    />
                  </div>
                </div>
                <div className="text-right flex-none w-24">
                  <p className="text-sm font-bold text-ink-900 tabular-nums">{Math.round(d.percent)}%</p>
                  <span className={['inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1', c.ring, c.bg, c.text].join(' ')}>
                    {d.nivel}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {onRestart && (
        <div className="text-center">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Reiniciar (demo)
          </button>
        </div>
      )}
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-md bg-white/70 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-base font-extrabold text-ink-900 tabular-nums">{value}</p>
    </div>
  );
}