'use client';

import IntegridadBarChart from './IntegridadBarChart';
import LikertBarChart      from './LikertBarChart';
import DiscRadarChart      from './DiscRadarChart';
import CognitiveBars       from '@/components/resultados/CognitiveBars';

/**
 * AnalisisPsicometrico — Tab 2
 * Concentra todas las gráficas de recharts.
 */
export default function AnalisisPsicometrico({ master }) {
  const bloquesPremium = [
    { key: 'motivadores',   titulo: 'Motivadores y Estilo de Trabajo',     codigo: 'MOT-01', gradient: 'from-amber-700 via-orange-600 to-rose-500' },
    { key: 'liderazgo',     titulo: 'Liderazgo y Toma de Decisiones',      codigo: 'LID-01', gradient: 'from-indigo-700 via-blue-600 to-cyan-500' },
    { key: 'ventas',        titulo: 'Ventas y Negociación',                codigo: 'VEN-01', gradient: 'from-rose-700 via-pink-600 to-fuchsia-500' },
    { key: 'trato_cliente', titulo: 'Trato al Cliente',                    codigo: 'TC-01',  gradient: 'from-teal-700 via-emerald-600 to-green-500' },
  ];

  return (
    <div className="space-y-6">
      <IntegridadBarChart data={master.integridad} />

      <DiscRadarChart data={master.disc} />

      {master.cognitivo?.respondidas > 0 && <CognitiveBars data={master.cognitivo} />}

      {bloquesPremium.map((b) => {
        const data = master[b.key];
        if (!data || !data.por_dimension || data.respondidas === 0) return null;
        return (
          <LikertBarChart
            key={b.key}
            data={data}
            titulo={b.titulo}
            codigo={b.codigo}
            gradient={b.gradient}
          />
        );
      })}
    </div>
  );
}