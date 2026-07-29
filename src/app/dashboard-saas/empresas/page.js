import { query } from '@/lib/db-mysql';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function EmpresasPage() {
  let empresas = [];
  let error = null;
  try {
    empresas = await query(`
      SELECT we.*, COUNT(DISTINCT up.id) AS users_count
      FROM workspaces_empresas we
      LEFT JOIN user_profiles up ON up.workspace_id = we.id
      GROUP BY we.id
      ORDER BY we.created_at DESC
    `);
  } catch (err) {
    error = err.message;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Workspaces</h1>
        <p className="text-slate-600 mt-1">Gestiona tus empresas y cuentas hijas.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
          Error: {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Empresa</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Giro</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Plan</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Usuarios</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Creada</th>
            </tr>
          </thead>
          <tbody>
            {empresas.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center px-4 py-8 text-sm text-slate-500">
                  No hay empresas registradas todavía. Usa el botón "Crear Empresa".
                </td>
              </tr>
            ) : (
              empresas.map((e) => (
                <tr key={e.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">{e.nombre_empresa}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{e.giro_industrial?.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{e.plan_activo}</span></td>
                  <td className="px-4 py-3 text-sm text-right text-slate-600">{e.users_count || 0}</td>
                  <td className="px-4 py-3 text-xs text-right text-slate-500">
                    {new Date(e.created_at).toLocaleDateString('es-MX')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
