/**
 * Detiene y elimina el proceso HR CORE de PM2.
 *
 * Uso:   npm run daemon:stop
 */
const { execSync } = require('child_process');

function run(cmd) {
  try { execSync(cmd, { stdio: 'inherit' }); return true; }
  catch { return false; }
}

console.log('\n\x1b[36m  HR CORE · Detener Daemon\x1b[0m\n');

if (run('pm2 stop HR CORE')) {
  console.log('  \x1b[32m✓\x1b[0m Proceso "HR CORE" detenido.');
}

if (run('pm2 delete HR CORE')) {
  console.log('  \x1b[32m✓\x1b[0m Proceso eliminado de PM2.');
}

console.log('\n  ℹ Para volver a iniciarlo: npm run daemon\n');