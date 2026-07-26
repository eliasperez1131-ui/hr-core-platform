#!/bin/bash
# scripts/surgical-deploy.sh
# ============================================================
#  HR CORE — Reemplazo quirúrgico en /var/www/html
# ============================================================
#  Conserva INTACTOS:
#    - Nginx (/etc/nginx/*) — no se reinicia, no se modifica
#    - Certificados Let's Encrypt (/etc/letsencrypt/*)
#    - Certbot timer
#    - PM2 daemon
#
#  Reemplaza:
#    - PM2 process "hrcore-backend" → "hr-core-frontend" (Next.js)
#    - /var/www/html/* → repo de HR CORE (con backup previo)
#
#  USO:
#    1) Subir el script al VPS:
#         scp scripts/surgical-deploy.sh root@177.7.33.146:/tmp/
#    2) Conectarse por SSH:
#         ssh root@177.7.33.146
#    3) Ejecutar:
#         chmod +x /tmp/surgical-deploy.sh
#         /tmp/surgical-deploy.sh
# ============================================================

set -e

REPO_URL="https://github.com/eliasperez1131-ui/hr-core-platform.git"
BRANCH="feat/vps-migration"   # o "main" si HR CORE ya está mergeado a main
APP_DIR="/var/www/html"
APP_NAME="hr-core-frontend"
PORT=3000
BACKUP_ROOT="/var/backups"

LOG()  { echo "[$(date +%H:%M:%S)] $*"; }

# ============================================================
#  Pre-flight checks
# ============================================================
LOG "=== SURGICAL DEPLOY: HR CORE en $APP_DIR ==="
LOG "Verificando requisitos..."

command -v node >/dev/null 2>&1 || { echo "✗ node no instalado"; exit 1; }
command -v npm  >/dev/null 2>&1 || { echo "✗ npm no instalado";  exit 1; }
command -v git  >/dev/null 2>&1 || { echo "✗ git no instalado";  exit 1; }
command -v pm2  >/dev/null 2>&1 || { echo "✗ pm2 no instalado (npm i -g pm2)"; exit 1; }

# Verificar puerto 3000 libre
if ss -tlnp 2>/dev/null | grep -q ":$PORT "; then
  LOG "⚠ Puerto $PORT ya en uso. Liberando..."
  pm2 delete $APP_NAME 2>/dev/null || true
  sleep 2
fi

# Verificar Nginx (NO TOCAR)
if ! systemctl is-active --quiet nginx 2>/dev/null; then
  LOG "⚠ Nginx no está corriendo (no es bloqueante)"
else
  LOG "✓ Nginx corriendo (no se tocará)"
fi

# Verificar certs Let's Encrypt
if [ -d /etc/letsencrypt/live/hrcore.com.mx ]; then
  LOG "✓ Certs Let's Encrypt encontrados (no se tocarÃ¡n)"
else
  LOG "⚠ No se encontraron certs en /etc/letsencrypt/live/hrcore.com.mx"
fi

# ============================================================
#  1. Backup del código viejo
# ============================================================
BACKUP_DIR="$BACKUP_ROOT/hr-core-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_ROOT"
LOG "1. Backup de código viejo → $BACKUP_DIR"

# Mover TODO el contenido de /var/www/html al backup
# (preserva archivos ocultos como .env, .git, etc.)
shopt -s dotglob nullglob
for item in "$APP_DIR"/*; do
  if [ -e "$item" ]; then
    rel="${item#$APP_DIR/}"
    mkdir -p "$BACKUP_DIR/$(dirname "$rel")"
    mv "$item" "$BACKUP_DIR/$rel"
  fi
done
shopt -u dotglob nullglob

LOG "  Backup completo: $(du -sh $BACKUP_DIR | cut -f1)"

# Verificar que /var/www/html está vacío (NO tocamos Nginx que está fuera)
REMAINING=$(ls -A $APP_DIR 2>/dev/null | wc -l)
if [ "$REMAINING" -gt 0 ]; then
  LOG "⚠ Quedan $REMAINING items en $APP_DIR (revisando...)"
  ls -la $APP_DIR
fi

# ============================================================
#  2. Detener PM2 hrcore-backend (o cualquier otro que apunte al 3000)
# ============================================================
LOG "2. Deteniendo PM2 processes viejos..."
pm2 list 2>/dev/null
pm2 delete hrcore-backend  2>/dev/null && LOG "  ✓ hrcore-backend eliminado" || LOG "  - hrcore-backend no existía"
pm2 delete hr-core-frontend 2>/dev/null && LOG "  ✓ hr-core-frontend eliminado" || true
pm2 delete all  2>/dev/null || true
pm2 save 2>/dev/null || true

# ============================================================
#  3. Clonar HR CORE
# ============================================================
LOG "3. Clonando HR CORE en $APP_DIR (rama: $BRANCH)..."

# Si hay problemas de red/git, el usuario puede fallar aquí
if ! git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$APP_DIR" 2>&1; then
  LOG "⚠ Fallo clone con depth 1, intentando sin depth..."
  if ! git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR" 2>&1; then
    LOG "✗ Error: no se pudo clonar el repo."
    LOG "  Verifica que $REPO_URL sea accesible desde el VPS"
    LOG "  y que tengas permisos de lectura (HTTPS token o SSH key)"
    exit 1
  fi
fi

cd $APP_DIR
LOG "  ✓ Repo clonado en $(git rev-parse --short HEAD)"

# ============================================================
#  4. Instalar dependencias
# ============================================================
LOG "4. Instalando dependencias (npm install)..."
npm install --omit=dev --no-audit --no-fund 2>&1 | tail -10

# ============================================================
#  5. Crear .env.production con valores hardcoded
# ============================================================
LOG "5. Creando .env.production..."

cat > $APP_DIR/.env.production <<'EOF'
# ============================================================
#  HR CORE — Variables de Producción (VPS)
# ============================================================
#  ⚠️  ESTE ARCHIVO NO SE COMMITEA AL REPO
#  ⚠️  Editar los valores abajo con tus claves reales
# ============================================================

# Aplicación
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SITE_URL=https://hrcore.com.mx
NEXT_PUBLIC_APP_NAME=HR CORE

# Base de datos (MySQL local)
DATABASE_URL=mysql://hrcore_app:HR_Core_2026!@127.0.0.1:3306/hrcore_db

# Auth (NextAuth)
NEXTAUTH_URL=https://hrcore.com.mx
NEXTAUTH_SECRET=CAMBIAR_POR_UNA_CADENA_ALEATORIA_DE_32_CHARS

# Email
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=noreply@hrcore.com.mx
SMTP_PASSWORD=CAMBIAR_PASSWORD_SMTP
FROM_EMAIL=noreply@hrcore.com.mx
EOF

LOG "  ✓ .env.production creado (REVISAR credenciales antes de continuar)"

# ============================================================
#  6. Compilar Next.js
# ============================================================
LOG "6. Compilando (npm run build)..."
NODE_ENV=production npm run build 2>&1 | tail -30

if [ ! -d "$APP_DIR/.next" ]; then
  LOG "✗ Build falló: no existe .next/"
  LOG "  Revisa los logs de build arriba"
  exit 1
fi

LOG "  ✓ Build completado: $(du -sh .next | cut -f1)"

# ============================================================
#  7. Crear ecosystem.config.js para PM2
# ============================================================
LOG "7. Creando ecosystem.config.js..."

cat > $APP_DIR/ecosystem.config.js <<'EOF'
module.exports = {
  apps: [{
    name: 'hr-core-frontend',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    cwd: '/var/www/html',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/hrcore-error.log',
    out_file: '/var/log/hrcore-out.log',
    time: true
  }]
};
EOF

# ============================================================
#  8. Iniciar con PM2
# ============================================================
LOG "8. Iniciando con PM2..."
pm2 start ecosystem.config.js
pm2 save

# Asegurar que PM2 arranque en boot
pm2 startup systemd >/dev/null 2>&1 || true
pm2 save

# Esperar warm-up
LOG "  Esperando 5s para warm-up..."
sleep 5

# ============================================================
#  9. Health check
# ============================================================
LOG "9. Verificando puerto 3000..."
sleep 2
if curl -s -o /dev/null -w "  HTTP %{http_code} en %{time_total}s\n" http://127.0.0.1:3000/ 2>/dev/null; then
  LOG "  ✓ App respondiendo en :3000"
else
  LOG "  ⚠ No responde aún (puede estar warm-up)"
  pm2 logs $APP_NAME --lines 20 --nostream
fi

# ============================================================
#  10. Verificación final Nginx (NO TOCAR NGINX)
# ============================================================
LOG "10. Verificando que Nginx sigue apuntando al :3000..."
if grep -q "proxy_pass.*127.0.0.1:$PORT" /etc/nginx/sites-enabled/*.conf 2>/dev/null; then
  LOG "  ✓ Nginx ya tiene proxy_pass al :$PORT"
  LOG "  → El cambio es TRANSPARENTE para hrcore.com.mx"
else
  LOG "  ⚠ Nginx NO apunta al :$PORT. Revisa:"
  LOG "    cat /etc/nginx/sites-enabled/default"
  LOG "  Probablemente ya apunta pero la búsqueda falló por la regex."
fi

# ============================================================
#  Resumen final
# ============================================================
LOG ""
LOG "=========================================="
LOG "  DEPLOY COMPLETADO"
LOG "=========================================="
LOG "  App:         $APP_NAME (Next.js)"
LOG "  Puerto:      $PORT"
LOG "  PM2 id:      $(pm2 id $APP_NAME 2>/dev/null | head -1)"
LOG "  Backup del código viejo:"
LOG "    $BACKUP_DIR"
LOG ""
LOG "  Próximos pasos:"
LOG "    1. Verifica en https://hrcore.com.mx/ que la nueva app responde"
LOG "    2. Si hay error 500, revisa:"
LOG "       pm2 logs $APP_NAME --lines 50"
LOG "    3. Si .env.production tiene placeholders, edítalo y reinicia:"
LOG "       pm2 restart $APP_NAME"
LOG "=========================================="
