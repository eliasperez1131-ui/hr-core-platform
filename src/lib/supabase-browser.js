/**
 * ============================================================
 *  HR CORE · Cliente "browser" (equiv a supabase-browser.js)
 * ============================================================
 *  Para client components. Delega fetch a /api/auth/* con cookies.
 * ============================================================
 */

'use client';

async function callApi(path, init = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || res.statusText);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function signInWithPassword({ email, password }) {
  return callApi('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function signOut() {
  return callApi('/api/auth/logout', { method: 'POST' });
}

export async function signUp({ email, password, options }) {
  return callApi('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      nombre_completo: options?.data?.nombre_completo,
    }),
  });
}
