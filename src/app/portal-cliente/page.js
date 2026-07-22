import { Suspense } from 'react';
import PortalClienteView from './PortalClienteView';

export const metadata = {
  title: 'Portal Cliente · HR CORE',
  description: 'Gestiona tus evaluaciones, revisa el Talento VIP y liquida facturas.',
  robots: { index: false, follow: false },
};

export default function PortalClientePage({ searchParams }) {
  return (
    <Suspense fallback={<div className="p-10 text-slate-500">Cargando portal…</div>}>
      <PortalClienteView searchParams={searchParams || {}} />
    </Suspense>
  );
}