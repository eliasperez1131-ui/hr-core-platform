'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * EvaluationAuthGuard — protege /evaluacion/[candidato_id].
 *
 * Verifica que el candidato haya pasado por /acceso-evaluacion
 * (es decir, que sessionStorage contenga sus credenciales válidas
 * y coincidan con el candidatoId de la URL).
 *
 * Si no hay sesión válida, redirige a /acceso-evaluacion?next=...
 */
export default function EvaluationAuthGuard({ candidatoId, candidatoNombre, children }) {
  const router = useRouter();
  const [state, setState] = useState('checking'); // checking | ok | redirecting

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sid  = sessionStorage.getItem('candidato_id');
    const stok = sessionStorage.getItem('candidato_token_acceso');

    if (!sid || !stok) {
      setState('redirecting');
      const next = encodeURIComponent(window.location.pathname);
      router.replace(`/acceso-evaluacion?next=${next}`);
      return;
    }

    if (sid !== candidatoId) {
      // El candidato en sessionStorage no corresponde a esta URL
      setState('redirecting');
      const next = encodeURIComponent(window.location.pathname);
      router.replace(`/acceso-evaluacion?next=${next}`);
      return;
    }

    setState('ok');
  }, [candidatoId, router]);

  if (state === 'checking' || state === 'redirecting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 mx-auto text-brand-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-3 text-sm text-slate-500">
            {state === 'checking' ? 'Verificando tu sesión…' : 'Redirigiendo al portal de acceso…'}
          </p>
          {state === 'redirecting' && (
            <Link
              href={`/acceso-evaluacion?next=${encodeURIComponent('/evaluacion/' + candidatoId)}`}
              className="mt-3 inline-block text-sm text-brand-600 hover:underline"
            >
              Ir al portal →
            </Link>
          )}
        </div>
      </div>
    );
  }

  return children;
}