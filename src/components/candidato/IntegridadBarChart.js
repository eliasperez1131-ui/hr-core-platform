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
} from 'recharts';

/**
 * Color por baremo (verde / amarillo / rojo).
 */
function colorPorPercent(percent) {
  if (percent >= 75) return '#10b981'; // emerald-500
  if (percent >= 40) return '#f59e0b'; // amber-500
  return '#f43f5e';                     // rose-500
}

/**
 * IntegridadBarChart — 18 dimensiones de integridad con semáforo de color.
 */
export default function IntegridadBarChart({ data }) {
  if (!data || !data.por_dimension) return null;

  const chartData = [...data.por_dimension]
    .sort((a, b) => b.percent - a.percent)
    .map((d) => ({
      dimension: d.dimension.replace(/^\d+\.\s*/, ''),
      fullName: d.dimension,
      percent: Math.round(d.percent),
      color: colorPorPercent(d.percent),
      weight_total: d.weight_total,
      puntos: d.puntos,
      max: d.max,
      nivel: d.nivel,
    }));

  const promedio = data.percent || 0;
  const rojos = chartData.filter(d => d.percent < 40).length;
  const amarillos = chartData.filter(d => d.percent >= 40 && d.percent < 75).length;
  const verdes = chartData.filter(d => d.percent >= 75).length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <header className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-brand-700 via-brand-600 to-accent-500 text-white flex items-center justify-between gap-3 flex-wrap">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-white/20">
            INT-01
          </span>
          <h3 className="mt-1 text-lg font-bold">Integridad Organizacional</h3>
          <p className="text-xs text-white/80">18 dimensiones · la dimensión 7 tiene doble peso.</p>
        </div>
        <div className="text-right text-xs">
          <p className="text-white/70">Percentil global</p>
          <p className="text-2xl font-extrabold">{data.percent}%</p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2 px-6 py-3 border-b border-slate-200 bg-slate-50">
        <MiniSemaforo count={verdes}    label="Óptimas"     color="bg-emerald-500" />
        <MiniSemaforo count={amarillos} label="Precaución"  color="bg-amber-500" />
        <MiniSemaforo count={rojos}     label="En riesgo"   color="bg-rose-500" />
      </div>

      <div className="p-6">
        <div className="h-[640px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 5 }} barCategoryGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="dimension" width={150} tick={{ fill: '#334155', fontSize: 11 }} interval={0} />
              <Tooltip content={<CustomTooltip promedio={promedio} />} />
              <Bar dataKey="percent" radius={[0, 4, 4, 0]} barSize={18}>
                {chartData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="font-semibold text-slate-700">Semáforo:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Óptimo (≥75%)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" /> Precaución (40-74%)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" /> Riesgo (&lt;40%)
          </span>
        </div>
      </div>
    </section>
  );
}

function MiniSemaforo({ count, label, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-xs font-semibold text-slate-700">{count}</span>
      <span className="text-[11px] text-slate-500">{label}</span>
    </div>
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
      {d.weight_total > 5 && <p className="text-amber-700">Dimensión con doble peso</p>}
      <p className="mt-1 text-slate-600">Nivel: <strong className="text-ink-900">{d.nivel}</strong></p>
      <p className="mt-1 text-slate-400">Promedio global: {promedio}%</p>
    </div>
  );
}