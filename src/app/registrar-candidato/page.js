import DashboardLayout         from '@/components/dashboard/DashboardLayout';
import RegistrarCandidatoFlow  from '@/components/candidatos/RegistrarCandidatoFlow';
import { VACANTES_ASIGNADAS_FREELANCE } from '@/lib/dashboard-data';

export const metadata = {
  title: 'Registrar candidato · HR CORE',
  description: 'Registra un nuevo candidato con deduplicación automática por email y teléfono.',
};

export default function RegistrarCandidatoPage({ searchParams }) {
  const vacanteId = searchParams?.vacante || VACANTES_ASIGNADAS_FREELANCE[0]?.id;
  const vacante   = VACANTES_ASIGNADAS_FREELANCE.find((v) => v.id === vacanteId);

  return (
    <DashboardLayout
      rol="Reclutador_Freelance"
      active="Mi pipeline"
      titulo="Registrar nuevo candidato"
      subtitulo={vacante ? `Para la vacante: ${vacante.titulo_puesto}` : 'Deduplicación automática por correo y teléfono.'}
    >
      <div className="max-w-3xl">
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 mb-6 text-sm text-brand-900 flex gap-3">
          <span className="text-2xl">🔍</span>
          <div>
            <p className="font-semibold">Deduplicación automática</p>
            <p className="mt-0.5">
              Al completar el correo o teléfono, el sistema busca coincidencias exactas en la base
              de datos. Si encuentra un candidato existente, abriremos su historial completo antes
              de vincularlo a esta vacante.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <RegistrarCandidatoFlow vacanteId={vacanteId} demoMode />
        </div>

        <div className="mt-4 text-xs text-slate-500">
          💡 <strong>Modo demo activo:</strong> usa los siguientes correos/teléfonos para
          ver el modal de historial en acción:
          <ul className="mt-1 ml-4 list-disc">
            <li><code>roberto.quintero@gmail.com</code></li>
            <li><code>+52 55 1234 5678</code></li>
            <li><code>javier.cordero@outlook.com</code></li>
            <li><code>+52 55 4422 8831</code></li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}