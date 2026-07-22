import { baremoToColor } from '@/lib/evaluation/scoring';

/**
 * Resumen global del candidato con TODAS las tarjetas disponibles.
 * Itera sobre `master` y muestra un card por cada bloque presente.
 *
 * Si el candidato no respondió un bloque, se omite automáticamente.
 */
export default function ResultadosOverview({ candidato, master }) {
  const integ = master.integridad;
  const cog   = master.cognitivo;
  const disc  = master.disc;

  const discResumen = disc.por_eje?.reduce(
    (acc, e) => (e.valor > acc.valor ? e : acc),
    { valor: 0, nombre: '—', eje: '—' },
  );

  // Definición de tarjetas Likert
  const likertCards = [
    { key: 'integridad',    titulo: 'Integridad',          codigo: 'INT-01', gradient: 'from-brand-700 via-brand-600 to-accent-500',     meta: (b) => `${b.respondidas}/${b.respondidas + b.faltantes} respondidas` },
    { key: 'motivadores',   titulo: 'Motivadores',         codigo: 'MOT-01', gradient: 'from-amber-700 via-orange-600 to-rose-500',     meta: (b) => `Reconoce ${b.por_dimension[0]?.dimension?.replace(/^\d+\.\s*/, '') || '—'}` },
    { key: 'liderazgo',     titulo: 'Liderazgo',           codigo: 'LID-01', gradient: 'from-indigo-700 via-blue-600 to-cyan-500',      meta: (b) => `Top: ${b.por_dimension[0]?.dimension?.replace(/^\d+\.\s*/, '') || '—'}` },
    { key: 'ventas',        titulo: 'Ventas',              codigo: 'VEN-01', gradient: 'from-rose-700 via-pink-600 to-fuchsia-500',    meta: (b) => `Top: ${b.por_dimension[0]?.dimension?.replace(/^\d+\.\s*/, '') || '—'}` },
    { key: 'trato_cliente', titulo: 'Trato al Cliente',    codigo: 'TC-01',  gradient: 'from-teal-700 via-emerald-600 to-green-500',   meta: (b) => `Top: ${b.por_dimension[0]?.dimension?.replace(/^\d+\.\s*/, '') || '—'}` },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900 text-white p-6 sm:p-8 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-300">
          Reporte psicométrico consolidado
        </p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
          {candidato?.nombre_completo || 'Candidato'}
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Generado el {new Date(master.generated_at).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {likertCards.map((c) => {
          const b = master[c.key];
          if (!b || !b.por_dimension || b.respondidas === 0) return null;
          return (
            <LikertCard
              key={c.key}
              titulo={c.titulo}
              codigo={c.codigo}
              baremo={b.baremo}
              percent={b.percent}
              percent_ajustado={b.percent_ajustado}
              meta={c.meta(b)}
              gradient={c.gradient}
            />
          );
        })}

        {cog && cog.respondidas > 0 && (
          <Card
            titulo="Cognitivo"
            codigo="COG-01"
            baremo={cog.baremo}
            percent={cog.percent}
            percent_ajustado={cog.percent_ajustado}
            meta={`${cog.aciertos}/${cog.total} aciertos`}
            gradient="from-sky-700 via-cyan-600 to-teal-500"
          />
        )}

        {disc && disc.por_eje && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-violet-700 via-fuchsia-600 to-pink-500 p-5 text-white">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-white/20">
                  DISC-01
                </span>
              </div>
              <h3 className="mt-2 text-base font-bold">DISC</h3>
            </div>
            <div className="p-5">
              <p className="text-3xl font-extrabold text-ink-900 tabular-nums">
                {discResumen.eje}<span className="text-base text-slate-400 ml-1">/6</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">Eje dominante</p>
              <p className="mt-3 text-xs text-slate-600">
                {discResumen.nombre}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function LikertCard({ titulo, codigo, baremo, percent, percent_ajustado, meta, gradient }) {
  return (
    <Card
      titulo={titulo}
      codigo={codigo}
      baremo={baremo}
      percent={percent}
      percent_ajustado={percent_ajustado}
      meta={meta}
      gradient={gradient}
    />
  );
}

function Card({ titulo, codigo, baremo, percent, percent_ajustado, meta, gradient }) {
  const c = baremo ? baremoToColor(baremo) : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className={`bg-gradient-to-br ${gradient} p-5 text-white`}>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-white/20">
            {codigo}
          </span>
          {baremo && (
            <span className="inline-flex items-center rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-white/20">
              {baremo}
            </span>
          )}
        </div>
        <h3 className="mt-2 text-base font-bold">{titulo}</h3>
      </div>
      <div className="p-5">
        {percent != null && percent_ajustado != null ? (
          <>
            <p className="text-4xl font-extrabold text-ink-900 tabular-nums">
              {percent_ajustado}<span className="text-base text-slate-400">/10</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">{percent}% percentil</p>
          </>
        ) : (
          <p className="text-3xl font-extrabold text-ink-900 tabular-nums">—</p>
        )}
        <p className="mt-3 text-xs text-slate-600">{meta}</p>
      </div>
    </div>
  );
}