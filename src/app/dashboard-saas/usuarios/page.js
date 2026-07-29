import { query } from '@/lib/db-mysql';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function UsuariosPage() {
  let usuarios = [];
  try {
    usuarios = await query(`
      SELECT u.*, w.nombre_empresa
      FROM user_profiles u
      LEFT JOIN workspaces_empresas w ON w.id = u.workspace_id
      WHERE u.rol != 'Cliente_Invitado' OR u.rol IS NULL
      ORDER BY u.created_at DESC
      LIMIT 100
    `);
  } catch (err) {
    // ignore
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
        <p className="text-slate-600 mt-1">Gestiona los usuarios de tu plataforma.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Rol</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Workspace</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Activo</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center px-4 py-8 text-sm text-slate-500">
                  No hay usuarios.
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">{u.nombre_completo || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{u.rol || 'N/A'}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{u.nombre_empresa || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block h-2 w-2 rounded-full ${u.activo ? 'bg-emerald-500' : 'bg-slate-300'}`} />
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
