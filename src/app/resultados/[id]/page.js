import { notFound } from 'next/navigation';
import ResultadosOverview from '@/components/resultados/ResultadosOverview';
import RadialDISC          from '@/components/resultados/RadialDISC';
import DimensionBars       from '@/components/resultados/DimensionBars';
import CognitiveBars       from '@/components/resultados/CognitiveBars';
import LikertBlockChart    from '@/components/resultados/LikertBlockChart';
import { calculateMasterScore, BLOQUES_LIKERT } from '@/lib/evaluation/scoring';
import { generateDemoRespuestas, DEMO_CANDIDATOS } from '@/lib/evaluation/demo-data';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export const metadata = {
  title: 'Resultados Psicométricos · HR CORE',
  description: 'Reporte consolidado de las 7 pruebas aplicadas (Integridad, Cognitivo, DISC, Motivadores, Liderazgo, Ventas, Trato).',
  robots: { index: false, follow: false },
};

export default function ResultadosPage({ params, searchParams }) {
  const { id } = params;

  const candidato =
    DEMO_CANDIDATOS[id] ||
    { id, nombre_completo: `Candidato ${id.slice(0, 8)}` };

  if (!candidato) notFound();

  // En producción, leer respuestas de la BD.
  // ?demo=0 fuerza respuestas vacías (para previsualizar el estado "sin datos").
  const respuestas = searchParams?.demo === '0'
    ? { integridad: {}, motivadores: {}, liderazgo: {}, ventas: {}, trato_cliente: {}, cognitivo: {}, disc: {} }
    : generateDemoRespuestas();

  const master = calculateMasterScore(respuestas);

  // Detectar bloques Likert ACTIVOS (con al menos 1 respuesta)
  const bloquesLikertActivos = ['integridad', 'motivadores', 'liderazgo', 'ventas', 'trato_cliente']
    .filter((k) => master[k]?.respondidas > 0)
    .map((k) => ({
      key: k,
      ...BLOQUES_LIKERT[k],
      data: master[k],
    }));

  const rol = searchParams?.rol || 'Super_Admin';

  return (
    <DashboardLayout
      rol={rol}
      active="Reportes"
      titulo="Resultados de Evaluación"
      subtitulo="Reporte consolidado de las pruebas aplicadas."
    >
      <div className="max-w-6xl space-y-6">
        <ResultadosOverview candidato={candidato} master={master} />

        {/* Integridad (caso especial por las 18 dimensiones + doble peso) */}
        {master.integridad?.respondidas > 0 && (
          <DimensionBars data={master.integridad} />
        )}

        {/* Bloques Likert adicionales (Motivadores, Liderazgo, Ventas, Trato) */}
        {bloquesLikertActivos
          .filter((b) => b.key !== 'integridad')
          .map((b) => (
            <LikertBlockChart
              key={b.key}
              data={b.data}
              codigo={b.codigo}
              titulo={b.nombre}
              subtitulo={`${b.data.por_dimension.length} dimensiones`}
              gradient={b.gradient}
            />
          ))}

        {/* Cognitivo y DISC */}
        {master.cognitivo?.respondidas > 0 && (
          <div className="grid lg:grid-cols-2 gap-6">
            <CognitiveBars data={master.cognitivo} />
            <RadialDISC data={master.disc} />
          </div>
        )}

        {/* Si no hay cognitivo, DISC a width completo */}
        {(!master.cognitivo || master.cognitivo.respondidas === 0) && master.disc?.por_eje && (
          <RadialDISC data={master.disc} />
        )}

        {/* Footer interpretativo */}
        <footer className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-600">
          <p className="font-semibold text-ink-900 mb-2">📋 Metodología</p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>
              <strong>Integridad (90 reactivos):</strong> Likert 1-5 con inversión de reactivos
              deshonestos y peso ×2 en la dimensión 7 (Honestidad y Confiabilidad).
            </li>
            <li>
              <strong>Motivadores, Liderazgo, Ventas, Trato al Cliente (12 reactivos c/u):</strong>
              Likert 1-5 con inversión de reactivos invertidos para control de aquiescencia.
              Calculados con el motor genérico <code>calculateLikertBloque()</code>.
            </li>
            <li>
              <strong>Cognitivo (30 reactivos):</strong> 10 de Razonamiento Numérico, 10 de
              Lógica Abstracta y 10 de Atención. 1 punto por acierto, 0 por error.
            </li>
            <li>
              <strong>DISC (24 reactivos):</strong> 6 reactivos por eje (D, I, S, C). +1 al
              eje por cada respuesta "Más", 0 por "Menos".
            </li>
            <li>
              <strong>Baremos:</strong> Bajo (&lt;40%) · Medio (40-64%) · Alto (65-84%) · Muy Alto (≥85%).
            </li>
            <li>
              <strong>Render dinámico:</strong> solo se grafican los bloques en los que el
              candidato tenga al menos 1 respuesta registrada.
            </li>
          </ul>
        </footer>
      </div>
    </DashboardLayout>
  );
}