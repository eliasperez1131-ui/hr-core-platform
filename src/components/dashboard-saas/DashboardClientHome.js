'use client';

export default function DashboardClientHome({ stats }) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Resumen</h1>
        <p className="text-slate-600 mt-1">Aquí tienes el resumen de tu cuenta.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Vacantes abiertas" value={stats.vacantes_abiertas || 0} hint={`de ${stats.total_vacantes || 0} totales`} />
        <StatCard label="Candidatos" value={stats.total_candidatos || 0} hint="totales" />
        <StatCard label="Empresas" value={stats.total_empresas || 0} hint="registradas" />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a href="/dashboard-saas/vacantes/nueva" className="px-4 py-3 bg-blue-50 text-blue-700 rounded-md text-sm font-semibold hover:bg-blue-100">
            + Crear nueva vacante
          </a>
          <a href="/dashboard-saas/empresas" className="px-4 py-3 bg-slate-50 text-slate-700 rounded-md text-sm font-semibold hover:bg-slate-100">
            Ver empresas
          </a>
          <a href="/dashboard-saas/prospectos" className="px-4 py-3 bg-slate-50 text-slate-700 rounded-md text-sm font-semibold hover:bg-slate-100">
            Ver prospectos
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="text-xs text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-3xl font-bold text-slate-900 mt-1">{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}
