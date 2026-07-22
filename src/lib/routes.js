/**
 * Mapeo central de rutas protegidas por rol.
 * Usado por:
 *   - middleware.js (para redireccionar tras login y bloquear acceso)
 *   - /api/auth/login (para determinar a dónde enviar al usuario)
 *   - componentes cliente (para mostrar/ocultar navegación)
 */

export const HOME_POR_ROL = {
  Super_Admin:           '/dashboard-saas',
  Administrador_Agencia: '/dashboard-saas',
  Coordinador:           '/dashboard-saas',
  Cliente_SaaS:          '/dashboard-saas',
  Reclutador_Freelance:  '/dashboard-freelance',
  Cliente_Invitado:      '/dashboard-saas',
};

export const LABEL_POR_ROL = {
  Super_Admin:           'Super Administrador',
  Administrador_Agencia: 'Administrador de Agencia',
  Coordinador:           'Coordinador',
  Cliente_SaaS:          'Cliente SaaS',
  Reclutador_Freelance:  'Reclutador Freelance',
  Cliente_Invitado:      'Cliente Invitado',
};

/**
 * Rutas protegidas y los roles que tienen acceso.
 * El middleware las lee para validar cada request.
 */
export const RUTAS_PROTEGIDAS = [
  {
    prefix: '/dashboard-saas',
    roles:  ['Super_Admin', 'Administrador_Agencia', 'Coordinador', 'Cliente_SaaS'],
  },
  {
    prefix: '/dashboard-freelance',
    roles:  ['Super_Admin', 'Administrador_Agencia', 'Coordinador', 'Reclutador_Freelance'],
  },
  {
    prefix: '/crear-vacante',
    roles:  ['Super_Admin', 'Administrador_Agencia', 'Coordinador'],
  },
  {
    prefix: '/portal-cliente',
    roles:  ['Super_Admin', 'Cliente_SaaS'],
  },
  {
    prefix: '/admin',
    roles:  ['Super_Admin'],
  },
];

/**
 * Dada una ruta, devuelve los roles permitidos o null si es pública.
 */
export function rolesPermitidosPara(pathname) {
  for (const r of RUTAS_PROTEGIDAS) {
    if (pathname === r.prefix || pathname.startsWith(r.prefix + '/')) {
      return r.roles;
    }
  }
  return null;
}

/**
 * Determina si la ruta actual es pública pero solo para usuarios autenticados.
 * (Por ahora todas las públicas son accesibles anónimamente.)
 */
export const RUTAS_PUBLICAS = ['/', '/contacto', '/login', '/registro', '/recuperar-password'];