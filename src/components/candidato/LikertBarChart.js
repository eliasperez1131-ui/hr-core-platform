'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

function colorPorPercent(percent) {
  if (percent >= 75) return '#10b981';
  if (percent >= 40) return '#f59e0b';
  return '#f43f5e';
}

/**
 * LikertBarChart — Barras horizontales para los bloques Premium
 * (Motivadores, Liderazgo, Ventas, Trato al Cliente).
 *
 * Props:
 *   data   -> resultado del bloque (calculateLikertBloque)
 *   titulo -> "Motivadores y Estilo de Trabajo"
 *   codigo -> "MOT-01"
 *   gradient -> clases tailwind para el header
 */
export default function LikertBarChart({ data, titulo, codigo, gradient = 'from-indigo-700 via-blue-600 to-cyan-500' }) {
  if (!data || !data.por_dimension) return null;

  const chartData = [...data.por_dimension]
    .sort((a, b) => b.percent - a.percent)
    .map((d) => ({
      dimension: d.dimension.replace(/^\d+\.\s*/, ''),
      fullName: d.dimension,
      percent: Math.round(d.percent),
      color: colorPorPercent(d.percent),
      puntos: d.puntos,
      max: d.max,
      nivel: d.nivel,
    }));

  const promedio = data.percent || 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <header className={`px-6 py-4 border-b border-slate-200 bg-gradient-to-r ${gradient} text-white`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-white/20">
              {codigo}
            </span>
            <h3 className="mt-1 text-lg font-bold">{titulo}</h3>
          </div>
          <div className="text-right text-xs">
            <p className="text-white/70">Percentil</p>
            <p className="text-2xl font-extrabold">{data.percent}%</p>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 5 }} barCategoryGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="dimension" width={170} tick={{ fill: '#334155', fontSize: 11 }} interval={0} />
              <Tooltip content={<CustomTooltip promedio={promedio} />} />
              <ReferenceLine x={promedio} stroke="#cbd5e1" strokeDasharray="4 4" />
              <Bar dataKey="percent" radius={[0, 4, 4, 0]} barSize={20}>
                {chartData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function CustomTooltip({ active, payload, promedio }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-ink-900">{d.fullName}</p>
      <p className="mt-0.5 text-slate-600">Percentil: <strong className="text-ink-900">{d.percent}%</strong></p>
      <p className="text-slate-600">Puntos: <strong className="text-ink-900">{d.puntos}/{d.max}</strong></p>
      <p className="mt-1 text-slate-600">Nivel: <strong className="text-ink-900">{d.nivel}</strong></p>
      <p className="mt-1 text-slate-400">Promedio: {promedio}%</p>
    </div>
  );
}