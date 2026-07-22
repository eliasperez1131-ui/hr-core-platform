import Link from 'next/link';
import DashboardLayout  from '@/components/dashboard/DashboardLayout';
import CreditBalance    from '@/components/dashboard/CreditBalance';
import StatCard         from '@/components/dashboard/StatCard';
import ActivityTable    from '@/components/dashboard/ActivityTable';
import FinancialProjectionWidget from '@/components/dashboard/FinancialProjectionWidget';
import DelicadaBadge              from '@/components/dashboard/DelicadaBadge';
import GenerarCobroButton         from '@/components/GenerarCobroButton';
import {
  WORKSPACE_DEMO,
  ACTIVIDAD_RECIENTE,
  VACANTES_ASIGNADAS_FREELANCE,
  PROYECCION_FINANCIERA_DEMO,
} from '@/lib/dashboard-data';

export const metadata = {
  title: 'Dashboard Cliente SaaS · HR CORE',
  description: 'Panel principal para clientes SaaS: créditos, vacantes y actividad reciente.',
};

export default function DashboardSaasPage({ searchParams }) {
  const ws = WORKSPACE_DEMO;

  // Simula la lectura del rol desde la sesión.
  // En producción: const { data: profile } = await supabase.from('user_profiles')...
  const rolCreador = (searchParams && searchParams.rol) || 'Super_Admin';
  const verFinanciero = rolCreador === 'Super_Admin';

  return (
    <DashboardLayout
      rol={rolCreador === 'Super_Admin' ? 'Super_Admin' : 'Cliente_SaaS'}
      active="Inicio"
      titulo={`Hola, ${ws.nombre_empresa.split(' ')[0]} 👋`}
      subtitulo="Aquí tienes el resumen de hoy."
      topbarExtra={
        <Link
          href="/crear-vacante"
          className="hidden md:inline-flex items-center rounded-md bg-brand-600 hover:bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition shadow-glow"
        >
          + Nueva vacante
        </Link>
      }
    >
      {/* Banner para alternar entre roles (demo). En producción esto viene de la sesión. */}
      <DemoRoleSwitch current={rolCreador} />

      {/* 1. Barra de saldo + plan */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <CreditBalance plan={ws.plan_activo} />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <StatCard
            label="Vacantes abiertas"
            value="8"
            hint="2 cerradas este mes"
            delta="+2"
            deltaTone="up"
            icon={<path d="M3 7h18v13H3zM8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />}
          />
          <StatCard
            label="Candidatos evaluados"
            value="187"
            hint="Del total de créditos"
            delta="+24%"
            deltaTone="up"
            icon={<path d="M16 11a4 4 0 10-8 0 4 4 0 008 0zM3 21v-1a6 6 0 0112 0v1" />}
          />
        </div>
      </div>

      {/* 2. CTA principal: Crear Nueva Vacante */}
      <section className="mt-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-accent-500 p-8 lg:p-10">
          <div className="absolute inset-0 bg-grid-pattern bg-[size:30px_30px] opacity-20" />
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="text-white max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                ✨ Listo para reclutar
              </span>
              <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight">
                Crea una nueva vacante en menos de 2 minutos
              </h2>
              <p className="mt-2 text-brand-100">
                Configura puesto, turnos, sueldo y privacidad financiera.
                El sistema dispara automáticamente las 7 pruebas psicométricas.
              </p>
            </div>
            <Link
              href="/crear-vacante"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 hover:bg-brand-50 px-8 py-4 text-base font-bold transition shadow-2xl"
            >
              + Crear Nueva Vacante
            </Link>
          </div>
        </div>
      </section>

      {/* 2.5 Mis vacantes activas (con badges de delicada) */}
      <section className="mt-8">
        <MisVacantes vacantes={VACANTES_ASIGNADAS_FREELANCE} />
      </section>

      {/* 3. Tabla de Actividad Reciente */}
      <section className="mt-8">
        <ActivityTable rows={ACTIVIDAD_RECIENTE} />
      </section>

      {/* 4. Widget de Proyección Financiera — SOLO Super_Admin */}
      {verFinanciero && (
        <section className="mt-8">
          <FinancialProjectionWidget
            data={PROYECCION_FINANCIERA_DEMO}
            vacantes={VACANTES_ASIGNADAS_FREELANCE}
          />
        </section>
      )}
    </DashboardLayout>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
function MisVacantes({ vacantes = [] }) {
  if (vacantes.length === 0) return null;

  const delicadas = vacantes.filter((v) => v.es_delicada).length;
  const cerradas = vacantes.filter((v) => v.estatus === 'Cerrada' || v.estatus === 'Cerrada ');

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-ink-900">Mis vacantes</h3>
          {delicadas > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200">
              🔒 {delicadas} delicada{delicadas > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500">
            {vacantes.filter((v) => v.estatus !== 'Cerrada').length} activas · {cerradas.length} cerradas
          </span>
          <Link href="/crear-vacante" className="text-xs font-medium text-brand-600 hover:text-brand-800">
            + Nueva
          </Link>
        </div>
      </div>

      <ul className="divide-y divide-slate-100">
        {vacantes.map((v) => {
          const esCerrada = v.estatus === 'Cerrada';
          return (
            <li
              key={v.id}
              className={[
                'px-5 py-4 flex items-center justify-between gap-3 transition',
                v.es_delicada ? 'bg-rose-50/30 hover:bg-rose-50/60' : 'hover:bg-slate-50',
              ].join(' ')}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {v.es_delicada && (
                  <div className="mt-0.5 flex-none">
                    <DelicadaBadge size="md" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900 truncate">
                    {v.titulo_puesto}
                  </p>
                  <p className="text-xs text-slate-500">
                    {v.empresa} · {v.modalidad} · {v.ubicacion}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs flex-wrap">
                    <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
                      {v.tipo_jornada} · {v.detalle_turno}
                    </span>
                    {esCerrada && (
                      <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 font-bold">
                        🔒 Cerrada
                      </span>
                    )}
                    {esCerrada && v.cobro_cliente > 0 && (
                      <span className="inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700 font-bold">
                        💰 ${v.cobro_cliente.toLocaleString('es-MX')} MXN
                      </span>
                    )}
                    {v.es_delicada && (
                      <span className="text-rose-700 font-medium">
                        Coordinación 100% manual
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right flex-none flex flex-col items-end gap-2">
                <div>
                  <p className="text-sm font-bold text-ink-900">{v.candidatos_activos}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    candidatos
                  </p>
                </div>
                {esCerrada && (
                  <GenerarCobroButton
                    vacanteId={v.id}
                    cobroCliente={v.cobro_cliente}
                    titulo={v.titulo_puesto}
                    vacanteNombre={v.titulo_puesto}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

function DemoRoleSwitch({ current }) {
  const roles = [
    { value: 'Super_Admin',           label: 'Super Admin (ver todo)' },
    { value: 'Administrador_Agencia', label: 'Admin Agencia (sin finanzas)' },
    { value: 'Reclutador_Freelance',  label: 'Freelance (solo operativo)' },
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
      <span className="ml-auto text-slate-500">
        El widget financiero aparece solo si sos <strong>Super Admin</strong>.
      </span>
    </div>
  );
}