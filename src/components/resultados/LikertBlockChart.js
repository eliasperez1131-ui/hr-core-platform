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
import { baremoToColor } from '@/lib/evaluation/scoring';

const TONO_BG = {
  'Bajo':     '#f43f5e',
  'Medio':    '#f59e0b',
  'Alto':     '#0ea5e9',
  'Muy Alto': '#10b981',
};

/**
 * LikertBlockChart — gráfico de barras horizontales genérico
 * para CUALQUIER bloque tipo Likert (Integridad, Motivadores,
 * Liderazgo, Ventas, Trato al Cliente).
 *
 * Props:
 *   data        -> el objeto devuelto por calculateLikertBloque
 *   codigo      -> 'INT-01' | 'MOT-01' | 'LID-01' | 'VEN-01' | 'TC-01'
 *   titulo      -> string del bloque
 *   subtitulo   -> string (opcional)
 *   gradient    -> clases tailwind para el header gradiente
 *   mostrarPeso -> resaltar dimensiones con weight_total > 5
 */
export default function LikertBlockChart({
  data,
  codigo = '',
  titulo = '',
  subtitulo = '',
  gradient = 'from-brand-700 via-brand-600 to-accent-500',
  mostrarPeso = false,
}) {
  if (!data || !data.por_dimension) return null;

  // Ordenamos de mayor a menor
  const sorted = [...data.por_dimension].sort((a, b) => b.percent - a.percent);

  const chartData = sorted.map((d) => ({
    dimension: d.dimension.replace(/^\d+\.\s*/, ''),
    fullName: d.dimension,
    percent: Math.round(d.percent),
    nivel: d.nivel,
    color: TONO_BG[d.nivel] || '#3a5bff',
    weight_total: d.weight_total,
    puntos: d.puntos,
    max: d.max,
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
            {subtitulo && <p className="text-xs text-white/80">{subtitulo}</p>}
          </div>
          <div className="text-right text-xs">
            <p className="text-white/70">Percentil global</p>
            <p className="text-2xl font-extrabold">{data.percent}%</p>
            <p className="text-white/70">
              <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                {data.baremo}
              </span>
            </p>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
              barCategoryGap={6}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="dimension"
                width={160}
                tick={{ fill: '#334155', fontSize: 11 }}
                interval={0}
              />
              <Tooltip content={(p) => <CustomTooltip {...p} mostrarPeso={mostrarPeso} />} />
              <ReferenceLine
                x={promedio}
                stroke="#ffffff"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Promedio ${promedio}%`,
                  position: 'top',
                  fill: '#ffffff',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              />
              <Bar dataKey="percent" radius={[0, 4, 4, 0]} barSize={22}>
                {chartData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="font-semibold text-slate-700">Baremo:</span>
          {['Bajo', 'Medio', 'Alto', 'Muy Alto'].map((b) => (
            <span key={b} className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: TONO_BG[b] }}
              />
              {b}
            </span>
          ))}
          <span className="ml-auto text-[11px] text-slate-400">
            {data.respondidas}/{data.respondidas + data.faltantes} respondidas
          </span>
        </div>
      </div>
    </section>
  );
}

function CustomTooltip({ active, payload, mostrarPeso }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs max-w-xs">
      <p className="font-bold text-ink-900">{d.fullName}</p>
      <p className="mt-0.5 text-slate-600">
        Percentil: <strong className="text-ink-900">{d.percent}%</strong>
      </p>
      <p className="text-slate-600">
        Puntos: <strong className="text-ink-900">{d.puntos} / {d.max}</strong>
      </p>
      {mostrarPeso && d.weight_total > 5 && (
        <p className="text-amber-700">Dimensión con doble peso</p>
      )}
      <p className="mt-1 text-slate-600">
        Nivel: <strong className="text-ink-900">{d.nivel}</strong>
      </p>
    </div>
  );
}