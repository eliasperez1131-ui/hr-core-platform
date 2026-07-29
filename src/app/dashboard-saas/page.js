import { query } from '@/lib/db-mysql';
import DashboardClientHome from '@/components/dashboard-saas/DashboardClientHome';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function DashboardHomePage() {
  const stats = await query(`
    SELECT
      (SELECT COUNT(*) FROM vacantes WHERE workspace_id IS NOT NULL) AS total_vacantes,
      (SELECT COUNT(*) FROM vacantes WHERE workspace_id IS NOT NULL AND estatus = 'Abierta') AS vacantes_abiertas,
      (SELECT COUNT(*) FROM candidatos) AS total_candidatos,
      (SELECT COUNT(*) FROM user_profiles) AS total_usuarios,
      (SELECT COUNT(*) FROM workspaces_empresas) AS total_empresas
  `).then(r => r[0]).catch(() => ({}));

  return <DashboardClientHome stats={stats || {}} />;
}
