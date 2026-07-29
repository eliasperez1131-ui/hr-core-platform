import DashboardClientLayout from '@/components/dashboard-saas/DashboardClientLayout';
import { getSession } from '@/lib/session';
import { getCurrentUser } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function DashboardLayout({ children }) {
  const { user } = await getCurrentUser();
  if (!user) {
    redirect('/login?next=/dashboard-saas');
  }
  return <DashboardClientLayout user={user}>{children}</DashboardClientLayout>;
}
