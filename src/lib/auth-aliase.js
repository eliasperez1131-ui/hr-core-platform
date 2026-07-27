/**
 * Helper para resolver aliases de email.
 * 'ADMIN' -> 'admin@hrcore.com.mx'
 */
export function resolveEmail(email) {
  if (!email) return '';
  const trimmed = String(email).trim();
  if (trimmed.toUpperCase() === 'ADMIN') {
    return 'admin@hrcore.com.mx';
  }
  return trimmed.toLowerCase();
}
