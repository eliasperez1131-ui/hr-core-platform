'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

/**
 * LoginForm - Login de HR CORE.
 * Acepta "Usuario" en lugar de "Correo".
 * "ADMIN" -> "admin@hrcore.com.mx" automaticamente.
 * Usa window.location.href para evitar loop del SPA.
 */

const ADMIN_EMAIL_BACKEND = 'admin@hrcore.com.mx';
const ADMIN_ALIAS = 'ADMIN';

function resolverEmail(usuario) {
  if (!usuario) return '';
  const trimmed = String(usuario).trim();
  if (trimmed.toUpperCase() === ADMIN_ALIAS) return ADMIN_EMAIL_BACKEND;
  return trimmed;
}

function LoginFormInner() {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const errorParam = searchParams.get('error');
  const registeredParam = searchParams.get('registered');
  const resetParam = searchParams.get('reset');

  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(errorParam || '');
  const [info, setInfo] = useState(
    registeredParam
      ? 'Cuenta creada. Revisa tu correo si requieres confirmacion, luego inicia sesion.'
      : resetParam
        ? 'Si tu correo esta registrado, recibiras un enlace para restablecer tu contrasena.'
        : '',
  );
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState({ state: 'idle', message: '' });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);

    const emailResolved = resolverEmail(usuario);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailResolved, password, next: nextParam }),
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || 'No se pudo iniciar sesion.');
        setSubmitting(false);
        return;
      }

      // Hard navigation para evitar el loop del SPA
      const dest = (data.redirect && typeof data.redirect === 'string') ? data.redirect : '/dashboard-saas';
      window.location.href = dest;
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
      setSubmitting(false);
    }
  };

  const onForgot = async (e) => {
    e.preventDefault();
    setForgotStatus({ state: 'loading', message: '' });
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resolverEmail(forgotEmail) }),
      });
      const data = await res.json();
      setForgotStatus({
        state: 'success',
        message: data.message || 'Si el correo existe, recibiras un enlace.',
      });
    } catch {
      setForgotStatus({
        state: 'success',
        message: 'Si el correo existe, recibiras un enlace.',
      });
    }
  };

  const inputBase =
    'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder-slate-400 shadow-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none';

  return (
    <>
      {error && (
        <div role="alert" className="mb-5 rounded-md bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800 flex items-start gap-2">
          <svg className="h-5 w-5 flex-none text-rose-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      {info && (
        <div role="status" className="mb-5 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 flex items-start gap-2">
          <svg className="h-5 w-5 flex-none text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4 4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{info}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="usuario" className="block text-sm font-medium text-slate-700">
            Usuario
          </label>
          <input
            id="usuario"
            name="usuario"
            type="text"
            required
            autoComplete="username"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="ADMIN  -  o  -  tu@empresa.com"
            className={`${inputBase} mt-1`}
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Tip: escribe <code className="bg-slate-100 px-1 rounded font-mono">ADMIN</code> para entrar como Super Admin.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Contrasena
            </label>
            <button type="button" onClick={() => setForgotOpen(true)} className="text-xs font-medium text-brand-600 hover:text-brand-800">
              ?Olvidaste tu contrasena?
            </button>
          </div>
          <div className="relative mt-1">
            <input
              id="password"
              name="password"
              type={showPwd ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="**********"
              className={`${inputBase} pr-10`}
            />
            <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600" aria-label="Mostrar contrasena">
              {showPwd ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.244 7.244L21 21m-3.878-3.878l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <input id="remember" name="remember" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
          <label htmlFor="remember" className="ml-2 text-sm text-slate-600">Recordarme en este dispositivo</label>
        </div>

        <button type="submit" disabled={submitting} className="inline-flex w-full justify-center items-center rounded-md bg-brand-600 hover:bg-brand-700 px-4 py-3 text-sm font-semibold text-white transition shadow-glow disabled:opacity-60 disabled:cursor-not-allowed">
          {submitting ? 'Iniciando sesion...' : 'Iniciar sesion ->'}
        </button>
      </form>

      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-ink-900">Restablecer contrasena</h3>
                <p className="text-sm text-slate-600 mt-1">Te enviaremos un enlace seguro a tu correo.</p>
              </div>
              <button onClick={() => { setForgotOpen(false); setForgotStatus({ state: 'idle', message: '' }); }} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={onforgot} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-700">Correo o usuario</label>
                <input id="forgot-email" type="text" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="ADMIN o tu@empresa.com" className={`${inputBase} mt-1`} />
              </div>
              {forgotStatus.state === 'success' && (
                <p className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">{forgotStatus.message}</p>
              )}
              <button type="submit" disabled={forgotStatus.state === 'loading'} className="inline-flex w-full justify-center rounded-md bg-brand-600 hover:bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60">
                {forgotStatus.state === 'loading' ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Cargando...</div>}>
      <LoginFormInner />
    </Suspense>
  );
}
