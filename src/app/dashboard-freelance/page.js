import DashboardLayout          from '@/components/dashboard/DashboardLayout';
import EarningsWidget           from '@/components/freelance/EarningsWidget';
import AssignedVacanciesTable   from '@/components/freelance/AssignedVacanciesTable';
import {
  FREELANCE_DEMO,
  VACANTES_ASIGNADAS_FREELANCE,
  CONTRATOS_MES_FREELANCE,
} from '@/lib/dashboard-data';

export const metadata = {
  title: 'Dashboard Freelance · HR CORE',
  description: 'Panel del reclutador freelance: comisiones, contratados y vacantes asignadas.',
};

export default function DashboardFreelancePage() {
  const fl = FREELANCE_DEMO;

  return (
    <DashboardLayout
      rol="Reclutador_Freelance"
      active="Inicio"
      titulo={`Hola, ${fl.nombre_completo.split(' ')[0]} 👋`}
      subtitulo="Tu rendimiento de este mes."
    >
      {/* 1. Widget de ganancias (top bar) */}
      <EarningsWidget contratos={CONTRATOS_MES_FREELANCE} />

      {/* 2. Tabla de vacantes asignadas */}
      <section className="mt-8">
        <AssignedVacanciesTable rows={VACANTES_ASIGNADAS_FREELANCE} />
      </section>

      {/* 3. Tip / ayuda */}
      <section className="mt-8 rounded-xl border border-brand-200 bg-brand-50 p-5">
        <div className="flex gap-4">
          <div className="h-9 w-9 flex-none rounded-full bg-brand-100 text-brand-700 grid place-items-center font-bold">
            💡
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-900">
              Sube tu ranking completando pruebas rápido
            </p>
            <p className="text-sm text-brand-800 mt-1">
              Los reclutadores que cierran un candidato a menos de 7 días desde su postulación
              reciben un bono adicional del <strong>+15%</strong> en su próxima comisión.
            </p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}