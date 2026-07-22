'use client';

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const EJES_COLORS = {
  D: { fill: 'rgba(244, 63, 94, 0.30)',  stroke: '#e11d48' }, // rose
  I: { fill: 'rgba(245, 158, 11, 0.30)', stroke: '#d97706' }, // amber
  S: { fill: 'rgba(16, 185, 129, 0.30)', stroke: '#059669' }, // emerald
  C: { fill: 'rgba(99, 102, 241, 0.30)', stroke: '#4f46e5' }, // indigo
};

const EJE_NOMBRES = {
  D: 'D · Dominancia',
  I: 'I · Influencia',
  S: 'S · Estabilidad',
  C: 'C · Cumplimiento',
};

/**
 * RadialDISC — gráfico radar (perfil DISC).
 *
 * Props:
 *   data -> { por_eje: [{ eje, valor, max, percent, nivel }] }
 */
export default function RadialDISC({ data }) {
  if (!data || !data.por_eje) return null;

  const chartData = data.por_eje.map((d) => ({
    eje:    EJE_NOMBRES[d.eje] || d.eje,
    Puntaje: d.valor,
    max:     d.max,
    percent: d.percent,
    nivel:   d.nivel,
    color:   EJES_COLORS[d.eje]?.stroke || '#3a5bff',
  }));

  const totalMas = data.por_eje.reduce((acc, d) => acc + d.valor, 0);
  const ejeDominante = data.por_eje.reduce((max, d) => d.valor > max.valor ? d : max, data.por_eje[0]);
  const ejeMenor     = data.por_eje.reduce((min, d) => d.valor < min.valor ? d : min, data.por_eje[0]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <header className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-pink-500 text-white">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-white/20">
              DISC-01
            </span>
            <h3 className="mt-1 text-lg font-bold">Perfil DISC</h3>
            <p className="text-xs text-white/80">
              {totalMas} de {data.total_reactivos} afirmaciones marcadas como "Más"
            </p>
          </div>
          <div className="text-right text-xs">
            <p className="text-white/70">Eje dominante</p>
            <p className="font-bold">{ejeDominante?.nombre || '—'}</p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-6 p-6">
        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="#cbd5e1" />
              <PolarAngleAxis
                dataKey="eje"
                tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 6]}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickCount={4}
              />
              <Radar
                name="Puntaje"
                dataKey="Puntaje"
                stroke="#3a5bff"
                fill="#3a5bff"
                fillOpacity={0.35}
                strokeWidth={2.5}
                dot={{ r: 5, fill: '#3a5bff', stroke: '#fff', strokeWidth: 2 }}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Cards resumen por eje */}
        <div className="grid grid-cols-2 gap-3 content-start">
          {data.por_eje.map((d) => {
            const colors = EJES_COLORS[d.eje];
            return (
              <div
                key={d.eje}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold text-white"
                    style={{ backgroundColor: colors.stroke }}
                  >
                    {d.eje}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    {d.valor} / {d.max}
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold text-ink-900">{d.nombre}</p>
                <p className="mt-1 text-[11px] text-slate-500 leading-snug line-clamp-2">
                  {d.descripcion}
                </p>
                <div className="mt-3 h-1.5 w-full rounded-full bg-white overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${d.percent}%`,
                      backgroundColor: colors.stroke,
                    }}
                  />
                </div>
                <p className="mt-1 text-[10px] font-semibold text-slate-500">
                  {d.percent}% · {d.nivel}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer interpretativo */}
      <footer className="px-6 py-4 bg-slate-50 border-t border-slate-200 grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            Eje más alto
          </p>
          <p className="mt-0.5 font-bold text-ink-900">
            {ejeDominante?.eje} · {ejeDominante?.nombre} ({ejeDominante?.valor}/{ejeDominante?.max})
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Eje más bajo
          </p>
          <p className="mt-0.5 font-bold text-ink-900">
            {ejeMenor?.eje} · {ejeMenor?.nombre} ({ejeMenor?.valor}/{ejeMenor?.max})
          </p>
        </div>
      </footer>
    </section>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-ink-900">{d.eje}</p>
      <p className="mt-0.5 text-slate-600">
        Puntaje: <strong className="text-ink-900">{d.Puntaje} / {d.max}</strong>
      </p>
      <p className="text-slate-600">
        Percentil: <strong className="text-ink-900">{d.percent}%</strong>
      </p>
      <p className="text-slate-600">
        Nivel: <strong className="text-ink-900">{d.nivel}</strong>
      </p>
    </div>
  );
}