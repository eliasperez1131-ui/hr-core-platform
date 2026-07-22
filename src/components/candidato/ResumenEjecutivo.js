'use client';

import SemaforoBadge from './SemaforoBadge';

/**
 * ResumenEjecutivo — Tab 1
 * Vista rápida: baremo global + semáforo + tarjetas de resumen por bloque.
 */
export default function ResumenEjecutivo({ master, candidato }) {
  const bloques = [
    { key: 'integridad',    nombre: 'Integridad',        codigo: 'INT-01' },
    { key: 'motivadores',   nombre: 'Motivadores',       codigo: 'MOT-01' },
    { key: 'liderazgo',     nombre: 'Liderazgo',         codigo: 'LID-01' },
    { key: 'ventas',        nombre: 'Ventas',            codigo: 'VEN-01' },
    { key: 'trato_cliente', nombre: 'Trato al Cliente',  codigo: 'TC-01' },
  ];

  // Recomendación global
  const integridad = master.integridad;
  const cognitivo  = master.cognitivo;
  const disc       = master.disc;

  const integridadOk = integridad.percent >= 65;
  const cognitivoOk  = cognitivo.percent  >= 65;
  const integridadRiesgo = integridad.percent < 40;

  let recomendacion = '';
  let recomendacionTono = 'slate';
  if (integridadRiesgo) {
    recomendacion = '🔴 NO RECOMENDADO — Perfil de integridad bajo. Riesgo elevado de conducta deshonesta.';
    recomendacionTono = 'rose';
  } else if (integridadOk && cognitivoOk) {
    recomendacion = '🟢 RECOMENDADO — Perfil apto para avanzar a entrevista.';
    recomendacionTono = 'emerald';
  } else if (integridadOk) {
    recomendacion = '🟡 REVISAR — Integridad adecuada pero requiere validación adicional.';
    recomendacionTono = 'amber';
  } else {
    recomendacion = '🟡 PRECAUCIÓN — Perfil intermedio, no descartar pero requiere mayor evaluación.';
    recomendacionTono = 'amber';
  }

  return (
    <div className="space-y-5">
      {/* Recomendación */}
      <div className={[
        'rounded-xl border p-5',
        recomendacionTono === 'rose'    && 'bg-rose-50 border-rose-200',
        recomendacionTono === 'amber'   && 'bg-amber-50 border-amber-200',
        recomendacionTono === 'emerald' && 'bg-emerald-50 border-emerald-200',
        recomendacionTono === 'slate'   && 'bg-slate-50 border-slate-200',
      ].filter(Boolean).join(' ')}>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Recomendación automática
        </p>
        <p className="mt-1 text-base font-bold text-ink-900">{recomendacion}</p>
      </div>

      {/* Grid de tarjetas de resumen */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bloques.map((b) => {
          const data = master[b.key];
          if (!data || !data.por_dimension) return null;
          return (
            <div key={b.key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 ring-1 ring-slate-200">
                  {b.codigo}
                </span>
                <SemaforoBadge percent={data.percent} baremo={data.baremo} />
              </div>
              <h4 className="mt-2 text-sm font-bold text-ink-900">{b.nombre}</h4>
              <p className="mt-1 text-3xl font-extrabold text-ink-900 tabular-nums">
                {data.percent_ajustado}<span className="text-base text-slate-400">/10</span>
              </p>
              <p className="mt-2 text-[11px] text-slate-500">
                {data.por_dimension.length} dimensiones · {data.respondidas}/{data.respondidas + data.faltantes} respondidas
              </p>
            </div>
          );
        })}

        {/* Cognitivo */}
        {cognitivo && cognitivo.respondidas > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 ring-1 ring-slate-200">
                COG-01
              </span>
              <SemaforoBadge percent={cognitivo.percent} baremo={cognitivo.baremo} />
            </div>
            <h4 className="mt-2 text-sm font-bold text-ink-900">Cognitivo</h4>
            <p className="mt-1 text-3xl font-extrabold text-ink-900 tabular-nums">
              {cognitivo.percent_ajustado}<span className="text-base text-slate-400">/10</span>
            </p>
            <p className="mt-2 text-[11px] text-slate-500">
              {cognitivo.aciertos}/{cognitivo.total} aciertos · {cognitivo.por_bloque.length} subbloques
            </p>
          </div>
        )}

        {/* DISC */}
        {disc && disc.por_eje && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 ring-1 ring-slate-200">
                DISC-01
              </span>
              <SemaforoBadge percent={Math.max(...disc.por_eje.map((e) => e.percent))} baremo="Medio" />
            </div>
            <h4 className="mt-2 text-sm font-bold text-ink-900">DISC</h4>
            <p className="mt-1 text-3xl font-extrabold text-ink-900 tabular-nums">
              {disc.por_eje.reduce((m, e) => e.valor > m.valor ? e : m, disc.por_eje[0]).eje}
              <span className="text-base text-slate-400 ml-1">/6</span>
            </p>
            <p className="mt-2 text-[11px] text-slate-500">
              Eje dominante · {disc.por_eje.reduce((m, e) => e.valor > m.valor ? e : m, disc.por_eje[0]).nombre}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}