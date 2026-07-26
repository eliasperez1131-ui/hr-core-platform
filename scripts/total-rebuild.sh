#!/bin/bash
# scripts/total-rebuild.sh
# ============================================================
#  HR CORE — Demolición total + reconstrucción desde cero
# ============================================================
#  ⚠️  ADVERTENCIA: ESTE SCRIPT ES DESTRUCTIVO
#  ⚠️  Va a borrar /var/www/html, configs de Nginx y certs SSL
#  ⚠️  El sitio hrcore.com.mx estará CAÍDO durante ~15-30 minutos
# ============================================================
#  LO QUE HACE (en orden):
#  1. Backup final (configs + certs + código)
#  2. Mata procesos PM2 y node viejos
#  3. Borra código de app en /var/www/html
#  4. PURGA Nginx, Certbot y configs
#  5. Reinstala Node.js 20, Nginx, Certbot
#  6. Clona HR CORE desde feat/vps-migration
#  7. Crea .env.production con placeholders
#  8. Build + PM2 start
#  9. Reconfigura Nginx para hrcore.com.mx
#  10. Reemite certs Let's Encrypt con Certbot
#  11. Verifica todo
# ============================================================
#  LO QUE NO TOCA:
#  - MySQL (la BD hrcore_db sigue intacta)
#  - SSH / red / firewall
#  - Certbot ya no existente (se reinstala)
# ============================================================
#  USO:
#    1) Subir el script:
#         scp scripts/total-rebuild.sh root@177.7.33.146:/tmp/
#    2) Conectarse:
#         ssh root@177.7.33.146
#    3) Confirmar que tienes backup de la BD:
#         ls -lh /root/hrcore_db.sql
#    4) Ejecutar:
#         bash /tmp/total-rebuild.sh
# ============================================================

set -e

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

# ============================================================
#  Pre-flight checks (NO modifica nada)
# ============================================================
LOG "=== HR CORE · Demolición + Reconstrucción Total ==="
echo ""
WARN "Este script va a:"
echo "  - Detener todos los procesos PM2"
echo "  - Borrar /var/www/html (código de app)"
echo "  - Purgar Nginx, configs y certs Let's Encrypt"
echo "  - Reinstalar Node, PM2, Nginx, Certbot"
echo "  - Clonar HR CORE, build, arrancar"
echo "  - Reconfigurar Nginx + reemitir SSL"
echo ""
WARN "El sitio hrcore.com.mx estará CAÍDO durante ~15-30 minutos."
echo ""

read -p "¿Continuar? (escribe 'SI' para continuar): " CONFIRM
if [ "$CONFIRM" != "SI" ]; then
  echo "Cancelado por el usuario."
  exit 0
fi

# ============================================================
#  0. Backup final (CRÍTICO)
# ============================================================
LOG "0. Backup final (CRÍTICO)..."
TS=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$BACKUP_ROOT/total-rebuild-$TS"
mkdir -p "$BACKUP_DIR"

# Backup BD MySQL
WARN "Respaldando BD MySQL (hrcore_db)..."
if command -v mysqldump >/dev/null 2>&1; then
  mysqldump -uroot -p'123456' --single-transaction --routines --triggers \
    --add-drop-database --databases hrcore_db \
    > "$BACKUP_DIR/hrcore_db.sql" 2>/dev/null
  LOG "  ✓ BD respaldada: $BACKUP_DIR/hrcore_db.sql"
fi

# Backup código viejo (si existe)
if [ -d "$APP_DIR" ]; then
  cp -r "$APP_DIR" "$BACKUP_DIR/app-vieja" 2>/dev/null || true
  LOG "  ✓ Código viejo respaldado: $BACKUP_DIR/app-vieja"
fi

# Backup configs de Nginx (por si algo sale mal)
if [ -d /etc/nginx ]; then
  cp -r /etc/nginx "$BACKUP_DIR/nginx-vieja" 2>/dev/null || true
  LOG "  ✓ Nginx viejo respaldado: $BACKUP_DIR/nginx-vieja"
fi

# Backup certs Let's Encrypt (los viejos, expirados o no)
if [ -d /etc/letsencrypt ]; then
  cp -r /etc/letsencrypt "$BACKUP_DIR/letsencrypt-viejo" 2>/dev/null || true
  LOG "  ✓ Certs viejos respaldados: $BACKUP_DIR/letsencrypt-viejo"
fi

# Backup lista de paquetes instalados
dpkg --get-selections > "$BACKUP_DIR/packages.list" 2>/dev/null
LOG "  ✓ Lista de paquetes guardada"

# Backup del crontab
crontab -l > "$BACKUP_DIR/crontab.bak" 2>/dev/null
LOG ""
LOG "  Todo respaldado en: $BACKUP_DIR"

# ============================================================
#  1. Matar todos los procesos PM2 y node
# ============================================================
LOG ""
LOG "1. Matando procesos PM2 y node..."
pm2 kill 2>/dev/null || true
pm2 uninstall 2>/dev/null || true
sleep 1
pkill -9 -f "next start" 2>/dev/null || true
pkill -9 -f "node " 2>/dev/null || true
LOG "  ✓ Procesos matados"

# ============================================================
#  2. Purgar código de la app
# ============================================================
LOG ""
LOG "2. Purgando /var/www/html..."
if [ -d "$APP_DIR" ]; then
  rm -rf "$APP_DIR" 2>/dev/null
  mkdir -p "$APP_DIR"
  LOG "  ✓ /var/www/html limpio"
else
  mkdir -p "$APP_DIR"
  LOG "  - /var/www/html no existía, creado"
fi

# ============================================================
#  3. Purgar Nginx, configs y certs
# ============================================================
LOG ""
LOG "3. Purgando Nginx y certs..."

# Detener Nginx
systemctl stop nginx 2>/dev/null || true
systemctl disable nginx 2>/dev/null || true
sleep 1

# Purgar paquetes (--purge borra también configs)
DEBIAN_FRONTEND=noninteractive apt-get remove --purge -y \
  nginx nginx-common nginx-core nginx-full 2>/dev/null || true
DEBIAN_FRONTEND=noninteractive apt-get remove --purge -y \
  certbot python3-certbot-nginx 2>/dev/null || true
DEBIAN_FRONTEND=noninteractive apt-get autoremove -y 2>/dev/null || true

# Limpiar configs residuales
rm -rf /etc/nginx /var/log/nginx /var/lib/nginx 2>/dev/null
rm -rf /etc/letsencrypt /var/log/letsencrypt /var/lib/letsencrypt 2>/dev/null

# Limpiar archivos de systemd
rm -f /etc/systemd/system/multi-user.target.wants/nginx.service 2>/dev/null
rm -f /etc/systemd/system/certbot.timer 2>/dev/null
rm -f /etc/systemd/system/certbot.service 2>/dev/null
systemctl daemon-reload 2>/dev/null

LOG "  ✓ Nginx, certs y configs purgados"

# ============================================================
#  4. Reinstalar todo (Node 20, PM2, Nginx, Certbot)
# ============================================================
LOG ""
LOG "4. Actualizando apt e instalando dependencias..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y >/dev/null 2>&1
apt-get upgrade -y >/dev/null 2>&1

# Nginx + Certbot
apt-get install -y nginx certbot python3-certbot-nginx >/dev/null 2>&1
systemctl enable nginx 2>/dev/null

# Node 20 (via NodeSource)
if ! command -v node >/dev/null 2>&1 || [ "$(node -v 2>/dev/null | cut -d. -f1 | tr -d 'v')" -lt 20 ]; then
  LOG "  Instalando Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
  apt-get install -y nodejs >/dev/null 2>&1
fi

# PM2 global
if ! command -v pm2 >/dev/null 2>&1; then
  LOG "  Instalando PM2 global..."
  npm install -g pm2 >/dev/null 2>&1
fi

# Git
apt-get install -y git >/dev/null 2>&1

# Verificar versiones
LOG "  ✓ Node $(node -v)"
LOG "  ✓ npm $(npm -v)"
LOG "  ✓ pm2 $(pm2 -v)"
LOG "  ✓ nginx $(nginx -v 2>&1 | cut -d'/' -f2)"
LOG "  ✓ certbot $(certbot --version 2>&1 | head -1)"

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
LOG "  ✓ Clonado en $(git rev-parse --short HEAD)"

# ============================================================
#  6. Instalar dependencias
# ============================================================
LOG ""
LOG "6. Instalando dependencias npm (esto puede tardar 1-2 min)..."
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
#  ⚠️  EDITA ESTE ARCHIVO CON TUS CLAVES REALES
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

chmod 600 $APP_DIR/.env.production
LOG "  ✓ .env.production creado (permisos 600)"

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
LOG "  ✓ Build OK: $(du -sh .next | cut -f1)"

# ============================================================
#  9. Crear ecosystem.config.js para PM2
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

pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd >/dev/null 2>&1 || true
pm2 save

# Esperar warm-up
sleep 5

# Health check local
if curl -s -o /dev/null -w "  HTTP %{http_code} en %{time_total}s\n" \
   http://127.0.0.1:3000/ 2>/dev/null; then
  LOG "  ✓ App respondiendo en :3000"
else
  WARN "  App aún no responde (puede estar warm-up)"
  pm2 logs $APP_NAME --lines 30 --nostream --raw 2>/dev/null | tail -20
fi

# ============================================================
#  10. Configurar Nginx para hrcore.com.mx
# ============================================================
LOG ""
LOG "10. Configurando Nginx para $DOMAIN..."

# Eliminar default
rm -f /etc/nginx/sites-enabled/default

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
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN

# Validar config
nginx -t 2>&1 | head -3

# Reiniciar Nginx
systemctl restart nginx
sleep 2

if systemctl is-active --quiet nginx; then
  LOG "  ✓ Nginx corriendo"
else
  ERR "Nginx no arrancó. Revisa: journalctl -u nginx"
  exit 1
fi

# ============================================================
#  11. Emitir certificados SSL con Certbot
# ============================================================
LOG ""
LOG "11. Reemitiendo certificados SSL con Certbot..."

# Certbot automático con Nginx
certbot --nginx \
  -d $DOMAIN \
  -d www.$DOMAIN \
  --non-interactive \
  --agree-tos \
  --email admin@$DOMAIN \
  --redirect 2>&1 | tail -10

if [ -d /etc/letsencrypt/live/$DOMAIN ]; then
  LOG "  ✓ Certs SSL emitidos para $DOMAIN"
  ls -la /etc/letsencrypt/live/$DOMAIN/
else
  ERR "Certbot falló. Revisa: certbot certificates"
  exit 1
fi

# Auto-renovación
systemctl enable certbot.timer 2>/dev/null || true
systemctl start certbot.timer 2>/dev/null || true

# ============================================================
#  12. Verificación final
# ============================================================
LOG ""
LOG "12. Verificación final..."

echo ""
echo "  ESTADO DE SERVICIOS:"
echo "  ====================="
systemctl is-active nginx    >/dev/null && echo "    ✓ Nginx:    activo" || echo "    ✗ Nginx:    inactivo"
systemctl is-active mysql    >/dev/null && echo "    ✓ MySQL:    activo" || echo "    ✗ MySQL:    inactivo"
pm2 list 2>/dev/null | grep -q "$APP_NAME" && echo "    ✓ $APP_NAME: corriendo" || echo "    ✗ $APP_NAME: detenido"

echo ""
echo "  PRUEBAS HTTP:"
echo "  =============="
HTTP_LOCAL=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null)
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
echo "    1. Edita $APP_DIR/.env.production con tus claves REALES de Supabase"
echo "       (las 3 lineas marcadas con TU_*)"
echo "    2. Reinicia la app: pm2 restart $APP_NAME"
echo "    3. Verifica:  https://$DOMAIN/"
echo "    4. Si hay error 500: pm2 logs $APP_NAME --lines 50"
echo ""
echo "  ► PARA MIGRACIÓN DE BD (MySQL actual → schema de HR CORE):"
echo "    Las 14 migraciones SQL que tienes en /sql/ del repo son para PostgreSQL."
echo "    Para MySQL necesitarás un script de migración equivalente."
echo "    Avísame si quieres que lo genere."
echo ""
echo "============================================================"
