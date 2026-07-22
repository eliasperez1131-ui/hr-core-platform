'use client';

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const EJES_LABELS = {
  D: 'D · Dominancia',
  I: 'I · Influencia',
  S: 'S · Estabilidad',
  C: 'C · Cumplimiento',
};

/**
 * DiscRadarChart — Gráfico de telaraña (radar) para los 4 ejes DISC.
 *
 * Cada eje se grafica de 0 a 6 puntos (máx 6 reactivos "Más" por eje).
 */
export default function DiscRadarChart({ data }) {
  if (!data || !data.por_eje) return null;

  const chartData = data.por_eje.map((d) => ({
    eje: EJES_LABELS[d.eje] || d.eje,
    valor: d.valor,
    max: d.max,
    percent: d.percent,
    nivel: d.nivel,
  }));

  const totalMas = data.por_eje.reduce((acc, d) => acc + d.valor, 0);
  const dominante = data.por_eje.reduce((m, d) => d.valor > m.valor ? d : m, data.por_eje[0]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <header className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-pink-500 text-white flex items-center justify-between gap-3 flex-wrap">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-white/20">
            DISC-01
          </span>
          <h3 className="mt-1 text-lg font-bold">Perfil DISC</h3>
          <p className="text-xs text-white/80">
            Eje dominante: <strong>{dominante?.eje} · {dominante?.nombre}</strong>
          </p>
        </div>
        <div className="text-right text-xs">
          <p className="text-white/70">Afirmaciones "Más"</p>
          <p className="text-2xl font-extrabold">{totalMas}<span className="text-white/50 text-sm"> /24</span></p>
        </div>
      </header>

      <div className="grid lg:grid-cols-5 gap-6 p-6">
        <div className="lg:col-span-3 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="#cbd5e1" />
              <PolarAngleAxis dataKey="eje" tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }} />
              <PolarRadiusAxis angle={90} domain={[0, 6]} tick={{ fill: '#94a3b8', fontSize: 10 }} tickCount={4} />
              <Radar
                name="Puntaje"
                dataKey="valor"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.35}
                strokeWidth={2.5}
                dot={{ r: 5, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <ul className="lg:col-span-2 grid grid-cols-2 gap-3 content-start">
          {data.por_eje.map((d) => {
            const semaforo = colorSemaforo(d.percent);
            return (
              <li key={d.eje} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold text-white ${semaforo.bg}`}>
                    {d.eje}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{d.valor}/{d.max}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-ink-900">{d.nombre}</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white overflow-hidden">
                  <div className={`h-full ${semaforo.bg}`} style={{ width: `${d.percent}%` }} />
                </div>
                <p className={`mt-1 text-[10px] font-semibold ${semaforo.text}`}>
                  {Math.round(d.percent)}% · {d.nivel}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function colorSemaforo(percent) {
  if (percent >= 75) return { bg: 'bg-emerald-500', text: 'text-emerald-700' };
  if (percent >= 40) return { bg: 'bg-amber-500',   text: 'text-amber-700' };
  return                    { bg: 'bg-rose-500',    text: 'text-rose-700' };
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-ink-900">{d.eje}</p>
      <p className="mt-0.5 text-slate-600">Puntaje: <strong className="text-ink-900">{d.valor}/{d.max}</strong></p>
      <p className="text-slate-600">Percentil: <strong className="text-ink-900">{d.percent}%</strong></p>
      <p className="text-slate-600">Nivel: <strong className="text-ink-900">{d.nivel}</strong></p>
    </div>
  );
}