'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const onLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      /* continuar al redirect de todas formas */
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={onLogout}
      title="Cerrar sesión"
      className="p-2 rounded-md hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition"
      aria-label="Cerrar sesión"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
      </svg>
    </button>
  );
}