#!/bin/bash
# scripts/manual-deploy.sh
# ============================================================
#  Continúa el deploy desde el paso 6 (asume que /var/www/html
#  ya tiene el código extraído de hr-core-*.tar.gz)
# ============================================================
#  USO:
#    1) Subir el tar.gz:  scp hr-core-*.tar.gz root@177.7.33.146:/tmp/
#    2) En el VPS:
#         cd /var/www/html
#         tar -xzf /tmp/hr-core-*.tar.gz
#         bash /tmp/manual-deploy.sh
# ============================================================

set +e  # No abortar por errores individuales
set -o pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

LOG()  { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $*"; }
WARN() { echo -e "${YELLOW}⚠${NC} $*"; }
DONE() { echo -e "${GREEN}✓${NC} $*"; }
ERR()  { echo -e "${RED}✗${NC} $*"; }

APP_DIR="/var/www/html"
APP_NAME="hr-core-frontend"
PORT=3000
DOMAIN="hrcore.com.mx"

# ============================================================
#  0. Verificar que estamos en /var/www/html
# ============================================================
if [ "$(pwd)" != "$APP_DIR" ]; then
  WARN "No estás en $APP_DIR (estás en $(pwd))"
  echo "Cambiando a $APP_DIR..."
  cd $APP_DIR
fi

if [ ! -f "package.json" ]; then
  ERR "No hay package.json en $APP_DIR. ¿Se extrajo el tarball?"
  exit 1
fi

LOG "=== Continuando deploy en $(pwd) ==="

# ============================================================
#  6. npm install
# ============================================================
LOG ""
LOG "6. Instalando dependencias npm (1-2 min)..."
npm install --omit=dev --no-audit --no-fund 2>&1 | tail -5

# ============================================================
#  7. Crear .env.production con placeholders
# ============================================================
LOG ""
LOG "7. Creando .env.production con placeholders..."

if [ ! -f .env.production ]; then
  cat > .env.production <<'EOF'
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

# Base de datos MySQL local
DATABASE_URL=mysql://hrcore_app:HR_Core_2026!@127.0.0.1:3306/hrcore_db

# Supabase (reemplaza con tus claves reales)
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY_AQUI
SUPABASE_SERVICE_ROLE_KEY=TU_SUPABASE_SERVICE_ROLE_KEY_AQUI

# NextAuth
NEXTAUTH_URL=https://hrcore.com.mx
NEXTAUTH_SECRET=TU_NEXTAUTH_SECRET_AQUI

# Email
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=noreply@hrcore.com.mx
SMTP_PASSWORD=TU_SMTP_PASSWORD
FROM_EMAIL=noreply@hrcore.com.mx
EOF
  chmod 600 .env.production
  DONE "  .env.production creado (permisos 600)"
else
  WARN "  .env.production YA EXISTE - no se sobreescribe"
fi

# ============================================================
#  8. Build
# ============================================================
LOG ""
LOG "8. Compilando (npm run build)..."
NODE_ENV=production npm run build 2>&1 | tail -15

if [ ! -d ".next" ]; then
  ERR "Build falló: no existe .next/"
  echo "Revisa los logs de build arriba y corrige el error"
  exit 1
fi
DONE "  Build OK: $(du -sh .next | cut -f1)"

# ============================================================
#  9. PM2
# ============================================================
LOG ""
LOG "9. Configurando PM2..."

if [ ! -f ecosystem.config.js ]; then
  cat > ecosystem.config.js <<'EOF'
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
  DONE "  ecosystem.config.js creado"
fi

# Detener proceso previo si existe
pm2 delete $APP_NAME 2>/dev/null

# Iniciar
pm2 start ecosystem.config.js
pm2 save >/dev/null 2>&1
pm2 startup systemd >/dev/null 2>&1
pm2 save >/dev/null 2>&1

sleep 5

# Health check local
if curl -s -o /dev/null -w "  HTTP %{http_code} en %{time_total}s\n" \
   --max-time 10 http://127.0.0.1:3000/ 2>/dev/null; then
  DONE "  App respondiendo en :3000"
else
  WARN "  App aún no responde. Revisa:"
  echo "    pm2 logs $APP_NAME --lines 30"
fi

# ============================================================
#  10. Verificar Nginx (debe estar configurado)
# ============================================================
LOG ""
LOG "10. Verificando Nginx..."

if [ ! -d /etc/nginx/sites-available ]; then
  ERR "Nginx no está instalado. ¿Se ejecutó el paso 4 del total-rebuild.sh?"
  exit 1
fi

if [ ! -f /etc/nginx/sites-available/$DOMAIN ]; then
  WARN "No hay config de Nginx para $DOMAIN. Creando..."

  cat > /etc/nginx/sites-available/$DOMAIN <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name hrcore.com.mx www.hrcore.com.mx;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    access_log /var/log/nginx/hrcore.access.log;
    error_log  /var/log/nginx/hrcore.error.log;

    client_max_body_size 10M;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

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
    }
}
NGINX
  ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
fi

# Activar sitio
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN 2>/dev/null
rm -f /etc/nginx/sites-enabled/default 2>/dev/null

nginx -t 2>&1 | head -3
systemctl restart nginx 2>/dev/null
sleep 2

if systemctl is-active --quiet nginx 2>/dev/null; then
  DONE "  Nginx corriendo"
else
  ERR "Nginx no arrancó. Revisa: journalctl -u nginx -n 30"
  exit 1
fi

# ============================================================
#  11. SSL con Certbot (si no hay certs)
# ============================================================
LOG ""
LOG "11. Verificando SSL con Certbot..."

if [ ! -d /etc/letsencrypt/live/$DOMAIN ]; then
  WARN "No hay certs. Emitiendo..."
  certbot --nginx \
    -d $DOMAIN \
    -d www.$DOMAIN \
    --non-interactive \
    --agree-tos \
    --email admin@$DOMAIN \
    --redirect 2>&1 | tail -10

  if [ -d /etc/letsencrypt/live/$DOMAIN ]; then
    DONE "  Certs SSL emitidos"
  else
    ERR "Certbot falló. Revisa: certbot certificates"
    exit 1
  fi
else
  DONE "  Certs SSL ya existen en /etc/letsencrypt/live/$DOMAIN"
fi

systemctl enable certbot.timer 2>/dev/null
systemctl start  certbot.timer 2>/dev/null

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
echo "================================================"
echo "  DEPLOY COMPLETADO"
echo "================================================"
echo ""
echo "  ► IMPORTANTE — ANTES DE LA PRIMERA REQUEST:"
echo ""
echo "    1. Edita $APP_DIR/.env.production con tus claves REALES"
echo "       (especialmente Supabase y NEXTAUTH_SECRET):"
echo ""
echo "         nano $APP_DIR/.env.production"
echo ""
echo "    2. Reinicia la app:"
echo "         pm2 restart $APP_NAME"
echo ""
echo "    3. Verifica en https://$DOMAIN/"
echo ""
echo "  ► SI HAY ERROR 500:"
echo "       pm2 logs $APP_NAME --lines 50"
echo ""
echo "================================================"
