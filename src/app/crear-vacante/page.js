import DashboardLayout from '@/components/dashboard/DashboardLayout';
import VacanteForm     from '@/components/vacante/VacanteForm';
import { WORKSPACE_DEMO } from '@/lib/dashboard-data';

export const metadata = {
  title: 'Crear Nueva Vacante · HR CORE',
  description: 'Publica una nueva vacante con selector inteligente de turnos y privacidad financiera.',
};

export default function CrearVacantePage({ searchParams }) {
  // En producción: rolCreador viene de la sesión (auth.uid() → user_profiles.rol).
  // Aquí lo tomamos del query param ?rol= para poder DEMOSTRAR la privacidad financiera
  // cambiando entre roles.
  const rolCreador = (searchParams && searchParams.rol) || 'Super_Admin';

  return (
    <DashboardLayout
      rol={rolCreador}
      active="Nueva vacante"
      titulo="Crear Nueva Vacante"
      subtitulo="Define el puesto, los turnos y la configuración de privacidad."
    >
      <div className="max-w-4xl">
        {/* Banner demo para alternar entre roles */}
        <DemoRoleSwitch current={rolCreador} />

        <VacanteForm rolCreador={rolCreador} workspaceId={WORKSPACE_DEMO.id} />
      </div>
    </DashboardLayout>
  );
}

function DemoRoleSwitch({ current }) {
  const roles = [
    { value: 'Super_Admin',           label: 'Super Admin (ve finanzas)' },
    { value: 'Administrador_Agencia', label: 'Admin Agencia (sin finanzas)' },
    { value: 'Coordinador',           label: 'Coordinador (sin finanzas)' },
  ];
  return (
    <div className="mb-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 flex flex-wrap items-center gap-3 text-xs">
      <span className="font-semibold text-slate-700">🧪 Demo: simular rol activo →</span>
      {roles.map((r) => (
        <a
          key={r.value}
          href={`?rol=${r.value}`}
          className={[
            'inline-flex items-center rounded-md px-3 py-1 font-medium transition',
            current === r.value
              ? 'bg-brand-600 text-white shadow-glow'
              : 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100',
          ].join(' ')}
        >
          {r.label}
        </a>
      ))}
    </div>
  );
}