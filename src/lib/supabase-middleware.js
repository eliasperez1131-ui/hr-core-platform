import { createServerClient } from '@supabase/ssr';

/**
 * Cliente Supabase para usar dentro de Next.js middleware.js
 * (Edge runtime). Maneja el refresh automático de la sesión
 * leyendo/escribiendo cookies del request/response.
 */
export function createMiddlewareClient(request, response) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          // Las cookies en middleware se setean sobre el response,
          // no sobre el request.
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );
}