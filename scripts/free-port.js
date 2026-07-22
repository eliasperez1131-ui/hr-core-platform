/**
 * Libera (mata) cualquier proceso que esté ocupando un puerto específico.
 *
 * Uso:
 *   node scripts/free-port.js 3000
 *
 * Diseñado para ejecutarse como pre-script antes de `next dev` o `next start`.
 * Es multiplataforma (Windows, macOS, Linux) y tolera que el puerto esté libre.
 */
const { execSync } = require('child_process');
const os = require('os');

const port = parseInt(process.argv[2], 10);

if (!port || isNaN(port)) {
  console.error('[free-port] ❌ Debes indicar un puerto válido. Ej: node scripts/free-port.js 3000');
  process.exit(1);
}

function killOnWindows(targetPort) {
  try {
    const output = execSync(`netstat -ano | findstr :${targetPort}`, { encoding: 'utf8' });
    const pids = new Set();
    output.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const parts = trimmed.split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid) && pid !== '0') {
        pids.add(pid);
      }
    });
    if (pids.size === 0) return false;
    pids.forEach((pid) => {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        console.log(`[free-port] 🔪 Proceso ${pid} terminado (puerto ${targetPort}).`);
      } catch (e) {
        console.warn(`[free-port] ⚠️  No se pudo terminar PID ${pid}.`);
      }
    });
    return true;
  } catch (e) {
    return false;
  }
}

function killOnUnix(targetPort) {
  try {
    let cmd;
    if (os.platform() === 'darwin') {
      cmd = `lsof -ti tcp:${targetPort} | xargs kill -9 2>/dev/null`;
    } else {
      cmd = `fuser -k ${targetPort}/tcp 2>/dev/null || lsof -ti tcp:${targetPort} | xargs kill -9 2>/dev/null || true`;
    }
    execSync(cmd, { stdio: 'ignore', shell: '/bin/sh' });
    return true;
  } catch (e) {
    return false;
  }
}

console.log(`[free-port] 🔍 Verificando puerto ${port}...`);
const killed = os.platform() === 'win32' ? killOnWindows(port) : killOnUnix(port);

if (killed) {
  setTimeout(() => {
    console.log(`[free-port] ✅ Puerto ${port} liberado.`);
  }, 300);
} else {
  console.log(`[free-port] ✅ Puerto ${port} ya estaba libre.`);
}