import { Suspense } from 'react';
import AccesoForm from '@/components/auth/AccesoForm';
import Link from 'next/link';

export const metadata = {
  title: 'Portal de Evaluación · HR CORE',
  description: 'Ingresa con tu teléfono y token de acceso para iniciar tu evaluación.',
  robots: { index: false, follow: false },
};

export default function AccesoEvaluacionPage({ searchParams }) {
  const empresa = (searchParams && searchParams.empresa) || 'HR CORE';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center font-black text-white">
              HR
            </div>
            <span className="text-lg font-bold text-ink-900">
              HR<span className="text-brand-600">CORE</span>
            </span>
          </Link>
          <span className="text-xs text-slate-500 inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Conexión segura
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Suspense fallback={<div className="text-sm text-slate-500">Cargando…</div>}>
            <AccesoForm empresaNombre={empresa} />
          </Suspense>
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © {new Date().getFullYear()} HR CORE · Todos los derechos reservados.
      </footer>
    </div>
  );
}