/**
 * Activa el inicio automático de PM2 al boot del sistema.
 *
 * - Linux/macOS: ejecuta `pm2 startup` y muestra el comando sudo sugerido.
 * - Windows:     guía para instalar pm2-windows-startup.
 *
 * Uso (UNA sola vez):   npm run daemon:install
 */
const { execSync } = require('child_process');
const os = require('os');

const isWin = os.platform() === 'win32';

console.log('\n\x1b[36m  HR CORE · Activar inicio automático\x1b[0m\n');

if (isWin) {
  console.log('  \x1b[33mOpción 1 · pm2-windows-startup (recomendado)\x1b[0m\n');
  console.log('    npm install -g pm2-windows-startup');
  console.log('    pm2-startup install');
  console.log('    pm2 save');
  console.log('');
  console.log('  \x1b[33mOpción 2 · Tarea Programada de Windows\x1b[0m\n');
  console.log('    1. Abre "Programador de tareas" (taskschd.msc)');
  console.log('    2. Crear tarea → "Al iniciar sesión"');
  console.log('    3. Acción: ejecutar `pm2 resurrect`');
} else {
  try {
    execSync('pm2 startup', { stdio: 'inherit' });
    console.log('\n  \x1b[33mCopia y ejecuta el comando "sudo ..." que imprimió pm2\x1b[0m');
    console.log('  \x1b[33mLuego ejecuta:\x1b[0m');
    console.log('    pm2 save    \x1b[90m# ya ejecutado por npm run daemon\x1b[0m');
  } catch {
    console.log('\n  No se pudo ejecutar "pm2 startup".');
    console.log('  Asegúrate de tener pm2 instalado: npm install -g pm2');
  }
}

console.log('\n  Tras esto el servidor arrancará solo al iniciar el equipo.\n');