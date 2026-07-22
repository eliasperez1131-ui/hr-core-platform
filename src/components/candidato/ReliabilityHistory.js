import SemaforoBadge from './SemaforoBadge';

/**
 * ReliabilityHistory — Historial de Confiabilidad.
 *
 * SOLO visible para roles internos (Super_Admin / Administrador / Coordinador).
 * En la vista pública (Cliente Invitado / Magic Link), este componente NO se renderiza.
 *
 * Muestra:
 *  - Vacantes participadas
 *  - Inasistencias (cuántas veces no se presentó a entrevista/prueba)
 *  - Abandonos (cuántas veces empezó y no terminó)
 *  - Lista de sus últimas 3 postulaciones con el resultado
 */
export default function ReliabilityHistory({ candidato, historial = [] }) {
  const total       = candidato.vacantes_participadas || 0;
  const inasist     = candidato.inasistencias || 0;
  const abandonos   = candidato.abandonos || 0;
  const completadas = Math.max(0, total - inasist - abandonos);

  const ratioConfiabilidad = total > 0
    ? Math.round((completadas / total) * 100)
    : 100;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <header className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-ink-900 to-ink-800 text-white flex items-center justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 ring-1 ring-amber-400/30">
            🔒 SOLO USO INTERNO
          </span>
          <h3 className="mt-1 text-base font-bold">Historial de Confiabilidad</h3>
          <p className="text-xs text-slate-400">Solo visible para tu equipo de RH.</p>
        </div>
        <SemaforoBadge percent={ratioConfiabilidad} baremo={ratioConfiabilidad >= 80 ? 'Muy Alto' : ratioConfiabilidad >= 50 ? 'Medio' : 'Bajo'} />
      </header>

      <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-b border-slate-200">
        <Stat label="Vacantes participadas" value={total} hint="Total histórico" tone="brand" />
        <Stat
          label="Inasistencias"
          value={inasist}
          hint={inasist > 0 ? '⚠️ Riesgo' : 'Sin incidencias'}
          tone={inasist > 0 ? 'rose' : 'emerald'}
        />
        <Stat
          label="Abandonos"
          value={abandonos}
          hint={abandonos > 0 ? '⚠️ Riesgo' : 'Sin incidencias'}
          tone={abandonos > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Lista de postulaciones recientes */}
      {historial.length > 0 && (
        <div className="px-6 py-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Últimas postulaciones
          </h4>
          <ol className="space-y-2">
            {historial.map((h, i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-ink-900 truncate">{h.vacante || 'Vacante'}</p>
                  <p className="text-xs text-slate-500">{h.empresa || '—'} · {formatDate(h.fecha)}</p>
                </div>
                <span className={[
                  'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 flex-none',
                  h.estatus === 'Contratado'   ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                  : h.estatus === 'Apto'        ? 'bg-sky-50 text-sky-700 ring-sky-200'
                  : h.estatus === 'Rechazado'    ? 'bg-rose-50 text-rose-700 ring-rose-200'
                  : h.estatus === 'Inasistencia' ? 'bg-rose-50 text-rose-700 ring-rose-200'
                  : h.estatus === 'Abandono'     ? 'bg-orange-50 text-orange-700 ring-orange-200'
                  :                                    'bg-slate-100 text-slate-700 ring-slate-200',
                ].join(' ')}>
                  {h.estatus}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center">
        Ratio de confiabilidad: <strong className="text-ink-900">{completadas}/{total} ({ratioConfiabilidad}%)</strong> completadas sin incidencias.
      </div>
    </section>
  );
}

function Stat({ label, value, hint, tone }) {
  const tones = {
    brand:   'text-brand-700',
    emerald: 'text-emerald-700',
    rose:    'text-rose-700',
    amber:   'text-amber-700',
  };
  return (
    <div className="px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold tabular-nums ${tones[tone] || 'text-ink-900'}`}>{value}</p>
      <p className="text-[10px] text-slate-400">{hint}</p>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return '—'; }
}