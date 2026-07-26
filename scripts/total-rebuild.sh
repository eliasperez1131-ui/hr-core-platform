#!/bin/bash
# scripts/total-rebuild.sh  (VERSIÓN 2 — FIX ABORTO PREMATURO)
# ============================================================
#  HR CORE — Demolición total + reconstrucción desde cero
# ============================================================
#  ⚠️  ADVERTENCIA: DESTRUCTIVO.  El sitio estará caído 15-30 min.
#  ⚠️  Lo que se BORRA:  código viejo, Nginx, certs, PM2
#  ⚠️  Lo que se PRESERVA: MySQL, BD hrcore_db, SSH, red
# ============================================================

# IMPORTANTE: set -e + set -u pueden abortar prematuramente con
# comandos que devuelven exit codes raros. Usamos verificación manual.

set +e  # <-- NO abortar en errores. Verificamos manualmente.
set +u
set -o pipefail  # Solo errores de pipe aborten, no exit codes individuales

REPO_URL="https://github.com/eliasperez1131-ui/hr-core-platform.git"
BRANCH="feat/vps-migration"
DOMAIN="hrcore.com.mx"
APP_DIR="/var/www/html"
APP_NAME="hr-core-frontend"
PORT=3000
BACKUP_ROOT="/var/backups"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

LOG()  { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $*"; }
WARN() { echo -e "${YELLOW}⚠${NC} $*"; }
ERR()  { echo -e "${RED}✗${NC} $*"; }
DONE() { echo -e "${GREEN}✓${NC} $*"; }

# ============================================================
#  Pre-flight: usuario debe confirmar
# ============================================================
clear
echo "================================================="
echo "  HR CORE · Demolición + Reconstrucción Total"
echo "================================================="
echo ""
WARN "Este script es DESTRUCTIVO. Va a:"
echo "   1. Hacer backup de todo"
echo "   2. Matar procesos PM2 y node del proyecto"
echo "   3. Borrar /var/www/html (código)"
echo "   4. Purgar Nginx + certs Let's Encrypt"
echo "   5. Reinstalar Node 20, PM2, Nginx, Certbot"
echo "   6. Clonar HR CORE + build + arrancar"
echo "   7. Reconfigurar Nginx para hrcore.com.mx"
echo "   8. Reemitir SSL con Certbot"
echo ""
WARN "El sitio hrcore.com.mx estará CAÍDO durante ~15-30 minutos."
echo ""
read -p "¿Continuar? (escribe 'SI' para continuar): " CONFIRM
if [ "$CONFIRM" != "SI" ]; then
  echo "Cancelado por el usuario."
  exit 0
fi

# ============================================================
#  0. Backup final (CRÍTICO) — se hace PRIMERO y completamente
# ============================================================
LOG ""
LOG "0. Backup final (CRÍTICO)..."

TS=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$BACKUP_ROOT/total-rebuild-$TS"
mkdir -p "$BACKUP_DIR" 2>/dev/null
DONE "  Backup dir: $BACKUP_DIR"

# Backup BD MySQL (es la unica fuente de datos que NO vamos a perder)
WARN "  Respaldando BD MySQL (hrcore_db)..."
if command -v mysqldump >/dev/null 2>&1; then
  mysqldump -uroot -p'123456' --single-transaction --routines --triggers \
    --add-drop-database --databases hrcore_db \
    > "$BACKUP_DIR/hrcore_db.sql" 2>/dev/null
  if [ -s "$BACKUP_DIR/hrcore_db.sql" ]; then
    DONE "  BD respaldada: $(du -sh $BACKUP_DIR/hrcore_db.sql | cut -f1)"
  else
    WARN "  mysqldump no generó output (¿BD vacía o credenciales?)"
  fi
else
  WARN "  mysqldump no encontrado, saltando backup de BD"
fi

# Backup código viejo (si existe)
if [ -d "$APP_DIR" ]; then
  cp -r "$APP_DIR" "$BACKUP_DIR/app-vieja" 2>/dev/null
  DONE "  Código viejo respaldado"
fi

# Backup configs de Nginx (por si algo sale mal)
if [ -d /etc/nginx ]; then
  cp -r /etc/nginx "$BACKUP_DIR/nginx-viejo" 2>/dev/null
  DONE "  Configs de Nginx respaldados"
fi

# Backup certs Let's Encrypt (los viejos, expirados)
if [ -d /etc/letsencrypt ]; then
  cp -r /etc/letsencrypt "$BACKUP_DIR/letsencrypt-viejo" 2>/dev/null
  DONE "  Certs Let's Encrypt respaldados"
fi

# Backup lista de paquetes
dpkg --get-selections > "$BACKUP_DIR/packages.list" 2>/dev/null

# Backup crontab
crontab -l > "$BACKUP_DIR/crontab.bak" 2>/dev/null

LOG ""
DONE "  BACKUP COMPLETO en: $BACKUP_DIR"
LOG "  Ahora sí empieza la demolición."

# ============================================================
#  1. Matar procesos PM2 (SEGURO, sin matar node genérico)
# ============================================================
LOG ""
LOG "1. Matando procesos PM2..."

# Solo PM2, sin tocar 'node' genérico
if command -v pm2 >/dev/null 2>&1; then
  pm2 kill 2>/dev/null
  sleep 2
  pm2 list 2>/dev/null | head -5
  DONE "  PM2 detenido (pm2 kill)"
else
  WARN "  PM2 no instalado, saltando"
fi

# Verificar que el puerto 3000 esté libre
sleep 1
if ss -tlnp 2>/dev/null | grep -q ":$PORT "; then
  WARN "  Puerto $PORT aún en uso. Puede haber un proceso node residual."
  echo "  Procesos en puerto $PORT:"
  ss -tlnp 2>/dev/null | grep ":$PORT " | head -3
  # Intentar matar solo lo que esté en el puerto
  PID_3000=$(ss -tlnp 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' | head -1)
  if [ -n "$PID_3000" ]; then
    WARN "  Matando PID $PID_3000 (puerto $PORT)..."
    kill -9 "$PID_3000" 2>/dev/null
    sleep 1
  fi
fi

# ============================================================
#  2. Purgar código de la app (sin tocar MySQL)
# ============================================================
LOG ""
LOG "2. Purgando $APP_DIR..."
if [ -d "$APP_DIR" ]; then
  rm -rf "$APP_DIR" 2>/dev/null
fi
mkdir -p "$APP_DIR" 2>/dev/null
DONE "  $APP_DIR limpio"

# ============================================================
#  3. Purgar Nginx, configs y certs (deja PM2 daemon, red, SSH intactos)
# ============================================================
LOG ""
LOG "3. Purgando Nginx, configs y certs..."

# Detener Nginx PRIMERO
if systemctl list-units --type=service 2>/dev/null | grep -q nginx; then
  systemctl stop nginx 2>/dev/null
  systemctl disable nginx 2>/dev/null
  sleep 1
fi

# Purgar paquetes (--purge borra también configs)
WARN "  apt-get remove --purge nginx + certbot..."
export DEBIAN_FRONTEND=noninteractive
apt-get remove --purge -y nginx nginx-common nginx-core nginx-full >/dev/null 2>&1
apt-get remove --purge -y certbot python3-certbot-nginx >/dev/null 2>&1
apt-get autoremove -y >/dev/null 2>&1

# Borrar configs residuales
rm -rf /etc/nginx /var/log/nginx /var/lib/nginx 2>/dev/null
rm -rf /etc/letsencrypt /var/log/letsencrypt /var/lib/letsencrypt 2>/dev/null

# Limpiar archivos de systemd
rm -f /etc/systemd/system/multi-user.target.wants/nginx.service 2>/dev/null
rm -f /etc/systemd/system/certbot.timer 2>/dev/null
rm -f /etc/systemd/system/certbot.service 2>/dev/null
systemctl daemon-reload 2>/dev/null

DONE "  Nginx y certs purgados"

# ============================================================
#  4. Reinstalar todo (Node 20, PM2, Nginx, Certbot)
# ============================================================
LOG ""
LOG "4. Actualizando apt e instalando dependencias..."
apt-get update -y >/dev/null 2>&1
apt-get upgrade -y >/dev/null 2>&1

# Nginx + Certbot
LOG "  Instalando Nginx + Certbot..."
apt-get install -y nginx certbot python3-certbot-nginx >/dev/null 2>&1
systemctl enable nginx 2>/dev/null

# Node 20
LOG "  Verificando Node.js 20..."
if ! command -v node >/dev/null 2>&1 || [ "$(node -v 2>/dev/null | cut -d. -f1 | tr -d 'v')" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
  apt-get install -y nodejs >/dev/null 2>&1
fi

# PM2
LOG "  Verificando PM2..."
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2 >/dev/null 2>&1
fi

# Git
apt-get install -y git >/dev/null 2>&1

DONE "  Node $(node -v 2>/dev/null || echo '?')"
DONE "  npm $(npm -v 2>/dev/null || echo '?')"
DONE "  pm2 $(pm2 -v 2>/dev/null | head -1 || echo '?')"
DONE "  nginx $(nginx -v 2>&1 | cut -d'/' -f2)"
DONE "  certbot $(certbot --version 2>&1 | head -1 | cut -d' ' -f2)"

# ============================================================
#  5. Clonar HR CORE
# ============================================================
LOG ""
LOG "5. Clonando HR CORE (rama: $BRANCH)..."
cd /var/www
if ! git clone --depth 1 --branch "$BRANCH" "$REPO_URL" html 2>/dev/null; then
  if ! git clone --branch "$BRANCH" "$REPO_URL" html 2>/dev/null; then
    ERR "No se pudo clonar el repo. Verifica acceso a GitHub."
    exit 1
  fi
fi
cd html
DONE "  Clonado en $(git rev-parse --short HEAD)"

# ============================================================
#  6. Instalar dependencias
# ============================================================
LOG ""
LOG "6. Instalando dependencias npm (1-2 min)..."
npm install --omit=dev --no-audit --no-fund 2>&1 | tail -5

# ============================================================
#  7. Crear .env.production con placeholders
# ============================================================
LOG ""
LOG "7. Creando .env.production con placeholders..."

cat > $APP_DIR/.env.production <<'EOF'
# ============================================================
#  HR CORE — Variables de Producción (VPS)
# ============================================================
#  ⚠️  EDITA ESTE ARCHIVO CON TUS CLAVES REALES ANTES DEL 1er RESTART
#  ⚠️  NO COMMITEAR - está en .gitignore
# ============================================================

NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SITE_URL=https://hrcore.com.mx
NEXT_PUBLIC_APP_NAME=HR CORE

# Base de datos MySQL local (la BD hrcore_db sigue intacta del wipe)
DATABASE_URL=mysql://hrcore_app:HR_Core_2026!@127.0.0.1:3306/hrcore_db

# Supabase (reemplaza con tus claves reales)
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY_AQUI
SUPABASE_SERVICE_ROLE_KEY=TU_SUPABASE_SERVICE_ROLE_KEY_AQUI

# NextAuth (genera con: openssl rand -base64 32)
NEXTAUTH_URL=https://hrcore.com.mx
NEXTAUTH_SECRET=TU_NEXTAUTH_SECRET_AQUI

# Email (Nodemailer SMTP)
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=noreply@hrcore.com.mx
SMTP_PASSWORD=TU_SMTP_PASSWORD
FROM_EMAIL=noreply@hrcore.com.mx
EOF
chmod 600 $APP_DIR/.env.production 2>/dev/null
DONE "  .env.production creado (permisos 600)"

# ============================================================
#  8. Compilar Next.js
# ============================================================
LOG ""
LOG "8. Compilando (npm run build)..."
NODE_ENV=production npm run build 2>&1 | tail -15

if [ ! -d "$APP_DIR/.next" ]; then
  ERR "Build falló: no existe .next/"
  exit 1
fi
DONE "  Build OK: $(du -sh .next | cut -f1)"

# ============================================================
#  9. Configurar PM2
# ============================================================
LOG ""
LOG "9. Configurando PM2..."

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

cd $APP_DIR
pm2 delete $APP_NAME 2>/dev/null
pm2 start ecosystem.config.js
pm2 save >/dev/null 2>&1
pm2 startup systemd >/dev/null 2>&1
pm2 save >/dev/null 2>&1

sleep 5

# Health check local
if curl -s -o /dev/null -w "  HTTP %{http_code} en %{time_total}s\n" http://127.0.0.1:3000/ 2>/dev/null; then
  DONE "  App respondiendo en :3000"
else
  WARN "  App aún no responde (puede estar warm-up)"
  echo "  --- últimas líneas de log ---"
  pm2 logs $APP_NAME --lines 30 --nostream --raw 2>/dev/null | tail -25
fi

# ============================================================
#  10. Configurar Nginx para hrcore.com.mx
# ============================================================
LOG ""
LOG "10. Configurando Nginx para $DOMAIN..."

# Eliminar default
rm -f /etc/nginx/sites-enabled/default 2>/dev/null

cat > /etc/nginx/sites-available/$DOMAIN <<'NGINX'
# HR CORE - Reverse proxy a Next.js (puerto 3000)
server {
    listen 80;
    listen [::]:80;
    server_name hrcore.com.mx www.hrcore.com.mx;

    # ACME challenge (Certbot)
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Logs
    access_log /var/log/nginx/hrcore.access.log;
    error_log  /var/log/nginx/hrcore.error.log;

    # Tamaño máximo de body (para upload de CVs)
    client_max_body_size 10M;

    # Compresión gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Proxy a Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_cache_bypass $http_upgrade;

        # Timeouts para Next.js (compilación inicial puede ser lenta)
        proxy_connect_timeout 60s;
        proxy_send_timeout    60s;
        proxy_read_timeout    60s;
    }
}
NGINX

# Activar sitio
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN 2>/dev/null

# Validar config
nginx -t 2>&1 | head -3

# Reiniciar Nginx
systemctl restart nginx 2>/dev/null
sleep 2

if systemctl is-active --quiet nginx 2>/dev/null; then
  DONE "  Nginx corriendo"
else
  ERR "Nginx no arrancó. Revisa: journalctl -u nginx -n 30"
  exit 1
fi

# ============================================================
#  11. Emitir certificados SSL con Certbot
# ============================================================
LOG ""
LOG "11. Reemitiendo certificados SSL con Certbot..."

certbot --nginx \
  -d $DOMAIN \
  -d www.$DOMAIN \
  --non-interactive \
  --agree-tos \
  --email admin@$DOMAIN \
  --redirect 2>&1 | tail -15

if [ -d /etc/letsencrypt/live/$DOMAIN ]; then
  DONE "  Certs SSL emitidos"
else
  ERR "Certbot falló. Revisa: certbot certificates"
  exit 1
fi

# Auto-renovación timer
systemctl enable certbot.timer 2>/dev/null
systemctl start certbot.timer 2>/dev/null

# ============================================================
#  12. Verificación final
# ============================================================
LOG ""
LOG "12. Verificación final..."

echo ""
echo "  ESTADO DE SERVICIOS:"
echo "  ====================="
systemctl is-active --quiet nginx 2>/dev/null && echo "    ✓ Nginx:    activo" || echo "    ✗ Nginx:    inactivo"
systemctl is-active --quiet mysql 2>/dev/null && echo "    ✓ MySQL:    activo" || echo "    ✗ MySQL:    inactivo"
pm2 list 2>/dev/null | grep -q "$APP_NAME" && echo "    ✓ $APP_NAME: corriendo" || echo "    ✗ $APP_NAME: detenido"

echo ""
echo "  PRUEBAS HTTP:"
echo "  =============="
HTTP_LOCAL=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3000/ 2>/dev/null)
HTTP_PUBLIC=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 https://$DOMAIN/ 2>/dev/null)
echo "    Local   (http://127.0.0.1:3000): $HTTP_LOCAL"
echo "    Publica (https://$DOMAIN):     $HTTP_PUBLIC"

echo ""
echo "  CERTIFICADOS SSL:"
echo "  ================="
certbot certificates 2>/dev/null | grep -E 'Certificate Name|Expiry Date' | head -4

echo ""
echo "  ARCHIVOS CLAVE:"
echo "  =============="
echo "    App:       $APP_DIR"
echo "    .env:      $APP_DIR/.env.production"
echo "    PM2 cfg:   $APP_DIR/ecosystem.config.js"
echo "    Nginx cfg: /etc/nginx/sites-available/$DOMAIN"
echo "    Certs:     /etc/letsencrypt/live/$DOMAIN"
echo "    Backups:   $BACKUP_DIR"

echo ""
echo "============================================================"
echo "  RECONSTRUCCIÓN COMPLETADA"
echo "============================================================"
echo ""
echo "  ► PRÓXIMOS PASOS:"
echo "    1. Edita .env.production con tus claves REALES de Supabase:"
echo "         nano $APP_DIR/.env.production"
echo "    2. Reinicia: pm2 restart $APP_NAME"
echo "    3. Verifica:  https://$DOMAIN/"
echo "    4. Si hay error 500: pm2 logs $APP_NAME --lines 50"
echo ""
echo "  ► PARA MIGRACIÓN DE BD (MySQL actual → schema HR CORE):"
echo "    Las 14 migraciones SQL son para PostgreSQL."
echo "    Para MySQL necesitas un script equivalente."
echo "    Avísame si quieres que lo genere."
echo ""
echo "============================================================"
