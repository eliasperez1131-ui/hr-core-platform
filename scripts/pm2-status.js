/**
 * Muestra el estado de PM2.
 *
 * Uso:   npm run daemon:status
 */
const { execSync } = require('child_process');

try {
  execSync('pm2 status', { stdio: 'inherit' });
} catch {
  console.log('pm2 no está instalado o no responde.');
  process.exit(1);
}