import { query } from '@/lib/db-mysql';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function ProspectosPage() {
  let prospectos = [];
  try {
    prospectos = await query(`
      SELECT * FROM prospectos_pendientes
      ORDER BY created_at DESC
      LIMIT 200
    `);
  } catch (err) {
    // ignore
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Prospectos</h1>
        <p className="text-slate-600 mt-1">Leads que han contactado desde el landing.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Empresa</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Contacto</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Teléfono</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Interés</th>
            </tr>
          </thead>
          <tbody>
            {prospectos.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center px-4 py-8 text-sm text-slate-500">
                  No hay prospectos todavía.
                </td>
              </tr>
            ) : (
              prospectos.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">{p.nombre_empresa}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.nombre_contacto}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.correo_corporativo}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.telefono}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{p.interes}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
