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
import { baremoToColor } from '@/lib/evaluation/scoring';

const TONO_BG = {
  'Bajo':     '#f43f5e',
  'Medio':    '#f59e0b',
  'Alto':     '#0ea5e9',
  'Muy Alto': '#10b981',
};

/**
 * CognitiveBars — gráfico de barras de aciertos por subbloque cognitivo.
 */
export default function CognitiveBars({ data }) {
  if (!data || !data.por_bloque) return null;

  const chartData = data.por_bloque.map((b) => ({
    bloque: b.bloque,
    aciertos: b.aciertos,
    total: b.total,
    percent: Math.round(b.percent),
    nivel: b.nivel,
    color: TONO_BG[b.nivel] || '#3a5bff',
  }));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <header className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-sky-700 via-cyan-600 to-teal-500 text-white">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-white/20">
              COG-01
            </span>
            <h3 className="mt-1 text-lg font-bold">Prueba Cognitiva</h3>
            <p className="text-xs text-white/80">
              {data.aciertos} de {data.total} aciertos
            </p>
          </div>
          <div className="text-right text-xs">
            <p className="text-white/70">Percentil global</p>
            <p className="text-2xl font-extrabold">{data.percent}%</p>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="bloque"
                tick={{ fill: '#334155', fontSize: 11 }}
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="percent" radius={[4, 4, 0, 0]} barSize={60}>
                {chartData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla de detalle */}
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2 text-left">Subbloque</th>
                <th className="px-3 py-2 text-right">Aciertos</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-right">%</th>
                <th className="px-3 py-2 text-center">Nivel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.por_bloque.map((b) => {
                const c = baremoToColor(b.nivel);
                return (
                  <tr key={b.bloque}>
                    <td className="px-3 py-2 text-slate-700 font-medium">{b.bloque}</td>
                    <td className="px-3 py-2 text-right text-ink-900 font-bold">{b.aciertos}</td>
                    <td className="px-3 py-2 text-right text-slate-500">{b.total}</td>
                    <td className="px-3 py-2 text-right text-ink-900 font-bold">{Math.round(b.percent)}%</td>
                    <td className="px-3 py-2 text-center">
                      <span className={['inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1', c.ring, c.bg, c.text].join(' ')}>
                        {b.nivel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-ink-900">{d.bloque}</p>
      <p className="text-slate-600">
        Aciertos: <strong className="text-ink-900">{d.aciertos} / {d.total}</strong>
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