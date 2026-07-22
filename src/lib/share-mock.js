/**
 * Datos mock para previsualizar el portal /compartir/[token]
 * y el botón de "Generar Enlace Mágico" sin necesidad de
 * tener Supabase poblado.
 *
 * En producción, estos datos vienen de:
 *   - share_links.token → join vacantes → join vacante_candidatos
 *     → join candidatos WHERE visible_cliente = true
 */

export const SHARE_DEMO_TOKEN = 'demo-secure-token-7f3a8b9c2d1e';

export const SHARE_DEMO_DATA = {
  vacante: {
    id: 'v1',
    titulo_puesto: 'Guardia de Seguridad Intramuros',
    empresa: 'Grupo Seguridad del Norte S.A. de C.V.',
    ubicacion: 'Santa Fe, CDMX',
    modalidad: 'Presencial',
    tipo_jornada: 'Ciclico',
    detalle_turno: '24x24',
    sueldo_candidato: 12500,
  },
  candidatos: [
    {
      id: 'c1',
      nombre_completo: 'Ana Reyes Hernández',
      edad: 28,
      escolaridad: 'Bachillerato concluido',
      correo_mask: 'a****@gmail.com',
      telefono_mask: '••• •••• 4422',
      url_cv_pdf: null,
      iniciales: 'AR',
    },
    {
      id: 'c2',
      nombre_completo: 'Miguel Ángel Núñez',
      edad: 34,
      escolaridad: 'Licenciatura en Derecho',
      correo_mask: 'm****@hotmail.com',
      telefono_mask: '••• •••• 8831',
      url_cv_pdf: null,
      iniciales: 'MN',
    },
    {
      id: 'c3',
      nombre_completo: 'Sofía Lara Domínguez',
      edad: 26,
      escolaridad: 'Técnico en Seguridad',
      correo_mask: 's****@outlook.com',
      telefono_mask: '••• •••• 5510',
      url_cv_pdf: null,
      iniciales: 'SL',
    },
  ],
  expires_at: '2026-08-15T23:59:59Z',
  access_count: 4,
};

export function getDemoShareData(token) {
  if (token !== SHARE_DEMO_TOKEN) return null;
  return SHARE_DEMO_DATA;
}