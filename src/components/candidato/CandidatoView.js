'use client';

import { useRef } from 'react';
import DashboardLayout    from '@/components/dashboard/DashboardLayout';
import CandidatoHeader     from './CandidatoHeader';
import CandidatoTabs       from './CandidatoTabs';
import ResumenEjecutivo    from './ResumenEjecutivo';
import AnalisisPsicometrico from './AnalisisPsicometrico';
import CVOriginal          from './CVOriginal';
import ReliabilityHistory  from './ReliabilityHistory';

/**
 * CandidatoView — orquesta toda la página.
 *
 * Modos:
 *   - readOnly = false → vista interna (reclutador/admin/cliente SaaS)
 *     · Muestra ReliabilityHistory (solo si rol ∈ {Super_Admin, Administrador_Agencia, Coordinador})
 *     · Muestra botón "Descargar PDF"
 *   - readOnly = true  → vista Magic Link (Cliente Invitado)
 *     · OCULTA ReliabilityHistory completamente
 *     · OCULTA botón de edición
 *     · UI en modo solo lectura estricta
 */
export default function CandidatoView({
  candidato,
  vacante,
  resultado,
  rol = 'Reclutador_Freelance',
  readOnly = false,
}) {
  const printRef = useRef(null);

  const ROLES_INTERNOS = ['Super_Admin', 'Administrador_Agencia', 'Coordinador'];
  const esInterno = ROLES_INTERNOS.includes(rol);
  const mostrarHistorial = esInterno && !readOnly;

  // Historial simulado para los demos
  const historialDemo = buildDemoHistorial(candidato);

  return (
    <DashboardLayout
      rol={rol}
      active="Candidatos"
      titulo="Perfil del Candidato"
      subtitulo="Resultados psicométricos y datos del candidato."
    >
      <div className="max-w-6xl space-y-6 print:max-w-full">
        {/* Header */}
        <CandidatoHeader
          candidato={candidato}
          vacante={vacante}
          printRef={printRef}
          readOnly={readOnly}
        />

        {/* Historial de Confiabilidad — SOLO roles internos */}
        {mostrarHistorial && (
          <ReliabilityHistory candidato={candidato} historial={historialDemo} />
        )}

        {/* Contenido imprimible */}
        <div ref={printRef} className="space-y-6 print:space-y-8">
          {/* Header simplificado para impresión */}
          <div className="hidden print:block mb-6 pb-4 border-b border-slate-300">
            <h2 className="text-xl font-bold text-ink-900">
              Reporte de Evaluación · {candidato.nombre_completo}
            </h2>
            <p className="text-sm text-slate-600">
              {vacante?.titulo} · {vacante?.empresa}
            </p>
          </div>

          <CandidatoTabs
            resumen={<ResumenEjecutivo master={resultado} candidato={candidato} />}
            analisis={<AnalisisPsicometrico master={resultado} />}
            cv={<CVOriginal candidato={candidato} />}
          />

          {/* Footer del documento */}
          <footer className="text-center text-[11px] text-slate-400 pt-4 border-t border-slate-200">
            Generado el {new Date(resultado.generated_at).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })} ·
            HR CORE · Reporte confidencial
            {readOnly && ' · Vista de cliente (sin historial interno)'}
          </footer>
        </div>
      </div>
    </DashboardLayout>
  );
}

function buildDemoHistorial(candidato) {
  const total = candidato.vacantes_participadas || 0;
  if (total === 0) return [];
  const completadas = Math.max(0, total - (candidato.inasistencias || 0) - (candidato.abandonos || 0));
  const out = [];
  for (let i = 0; i < completadas; i++) {
    out.push({
      id: `h${i}`,
      vacante: ['Guardia de Seguridad Intramuros', 'Auxiliar de Almacén CEDIS', 'Supervisor de Turno', 'Atención al Cliente Sucursal'][i % 4],
      empresa: 'Grupo Seguridad del Norte',
      estatus: i === 0 ? 'Contratado' : 'Apto',
      fecha: new Date(Date.now() - (90 - i * 25) * 86400000).toISOString(),
    });
  }
  for (let i = 0; i < (candidato.inasistencias || 0); i++) {
    out.push({
      id: `i${i}`,
      vacante: 'Jefe de Turno Nocturno',
      empresa: 'Grupo Seguridad del Norte',
      estatus: 'Inasistencia',
      fecha: new Date(Date.now() - (60 - i * 20) * 86400000).toISOString(),
    });
  }
  for (let i = 0; i < (candidato.abandonos || 0); i++) {
    out.push({
      id: `a${i}`,
      vacante: 'Auxiliar de Monitoreo CCTV',
      empresa: 'Grupo Seguridad del Norte',
      estatus: 'Abandono',
      fecha: new Date(Date.now() - (40 - i * 15) * 86400000).toISOString(),
    });
  }
  return out.slice(0, 5);
}