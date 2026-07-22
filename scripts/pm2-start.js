/**
 * Levanta el servidor de Next.js bajo PM2 (modo "daemon").
 *
 * Pasos:
 *   1. Libera el puerto 3000 (mata cualquier proceso que lo ocupe).
 *   2. Verifica que pm2 esté instalado globalmente.
 *   3. Inicia (o reinicia) el proceso "HR CORE" desde ecosystem.config.js.
 *   4. Guarda la lista con `pm2 save` para sobrevivir reinicios.
 *   5. Muestra instrucciones para activar el inicio automático al boot.
 *
 * Uso:   npm run daemon
 */

const { execSync, spawn } = require('child_process');
const os = require('os');

const isWin = os.platform() === 'win32';

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, {
      stdio: opts.silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
      ...opts,
    });
  } catch (err) {
    if (opts.silent) return null;
    throw err;
  }
}

function header(title) {
  const line = '═'.repeat(60);
  console.log('\n\x1b[36m' + line + '\n  ' + title + '\n' + line + '\x1b[0m\n');
}

function ok(msg)   { console.log('  \x1b[32m✓\x1b[0m ' + msg); }
function info(msg) { console.log('  \x1b[36mℹ\x1b[0m ' + msg); }
function warn(msg) { console.log('  \x1b[33m⚠\x1b[0m ' + msg); }
function err(msg)  { console.log('  \x1b[31m✗\x1b[0m ' + msg); }

(async () => {
  header('HR CORE · Daemon (PM2)');

  // 1) Liberar el puerto 3000
  info('Liberando puerto 3000...');
  run('node scripts/free-port.js 3000', { silent: true });
  ok('Puerto 3000 libre.');

  // 2) Verificar pm2
  info('Verificando instalación de pm2...');
  let hasPm2 = false;
  try {
    run('pm2 --version', { silent: true });
    hasPm2 = true;
    ok('pm2 ya está instalado.');
  } catch {
    warn('pm2 no detectado. Instalando globalmente...');
    try {
      run('npm install -g pm2', { silent: false });
      hasPm2 = true;
      ok('pm2 instalado.');
    } catch {
      err('No se pudo instalar pm2. Ejecuta manualmente: npm install -g pm2');
      process.exit(1);
    }
  }

  // 3) ¿Ya existe el proceso HR CORE?
  info('Verificando si el proceso "HR CORE" ya existe...');
  let existing = null;
  try {
    const json = run('pm2 jlist', { silent: true }) || '[]';
    const list = JSON.parse(json);
    existing = list.find((p) => p.name === 'HR CORE');
  } catch { /* pm2 jlist vacío = no hay procesos */ }

  if (existing) {
    info('Proceso "HR CORE" detectado. Recargando...');
    try {
      run('pm2 reload ecosystem.config.js', { silent: false });
      ok('Proceso recargado con la configuración actualizada.');
    } catch {
      run('pm2 delete HR CORE', { silent: false });
      run('pm2 start ecosystem.config.js', { silent: false });
      ok('Proceso reiniciado.');
    }
  } else {
    info('Iniciando proceso "HR CORE"...');
    try {
      run('pm2 start ecosystem.config.js', { silent: false });
      ok('Proceso iniciado bajo pm2.');
    } catch (e) {
      err('No se pudo iniciar el proceso.');
      process.exit(1);
    }
  }

  // 4) pm2 save — guarda la lista para resurrect al boot
  info('Guardando lista de procesos (pm2 save)...');
  try {
    run('pm2 save', { silent: false });
    ok('Lista guardada.');
  } catch {
    warn('No se pudo ejecutar "pm2 save". Puedes correrlo manualmente más tarde.');
  }

  // 5) Estado final
  header('Estado');
  try {
    run('pm2 status', { silent: false });
  } catch { /* ignore */ }

  // 6) Instrucciones para el inicio automático
  header('Inicio automático al boot del sistema');

  if (isWin) {
    console.log('  En Windows, usa "pm2-windows-startup":\n');
    console.log('    \x1b[33mnpm install -g pm2-windows-startup\x1b[0m');
    console.log('    \x1b[33mpm2-startup install\x1b[0m');
    console.log('    \x1b[33mpm2 save\x1b[0m            \x1b[90m# (ya ejecutado arriba)\x1b[0m\n');
    console.log('  Después de esto, el servidor arrancará con Windows automáticamente.\n');
  } else {
    console.log('  Ejecuta UNA sola vez para activar el inicio en boot:\n');
    console.log('    \x1b[33mpm2 startup\x1b[0m   \x1b[90m# copia y ejecuta el comando sudo que imprime\x1b[0m');
    console.log('    \x1b[33mpm2 save\x1b[0m      \x1b[90m# (ya ejecutado arriba)\x1b[0m\n');
    console.log('  En Linux/macOS el proceso sobrevivirá reinicios del sistema.\n');
  }

  header('Comandos útiles');
  console.log('  npm run daemon:logs    → Ver logs en vivo (tail)');
  console.log('  npm run daemon:status  → Estado del proceso');
  console.log('  npm run daemon:stop    → Detener el servidor');
  console.log('  npm run daemon:install → Activar inicio al boot');
  console.log('');
})();