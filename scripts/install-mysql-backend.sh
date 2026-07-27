#!/bin/bash
# scripts/install-mysql-backend.sh
# ============================================================
#  Sube al VPS los archivos de la capa MySQL/JWT, los instala,
#  reinicia PM2 y verifica el login.
# ============================================================
#  USO:
#    1) Desde tu PC local (PowerShell):
#         scp -r src/lib/db-mysql.js src/lib/session.js \
#               src/lib/supabase-*.js src/lib/auth-aliase.js \
#               src/middleware.js src/app/api/auth/login \
#               src/app/api/auth/logout src/app/api/auth/register \
#               root@177.7.33.146:/tmp/hr-core-backend/
#    2) Desde el VPS:
#         bash /tmp/hr-core-backend/install-mysql-backend.sh
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
DONE() { echo -e "${GREEN}✓${NC} $*"; }
WARN() { echo -e "${YELLOW}⚠${NC} $*"; }
ERR()  { echo -e "${RED}✗${NC} $*"; }
LOG()  { echo ""; echo "=== $* ==="; }

cd /var/www/html

# 1. Copiar archivos de la lib
LOG "Paso 1/8: Copiar lib/"
cp /tmp/hr-core-backend/db-mysql.js        src/lib/
cp /tmp/hr-core-backend/session.js          src/lib/
cp /tmp/hr-core-backend/auth-aliase.js      src/lib/
cp /tmp/hr-core-backend/supabase-browser.js   src/lib/
cp /tmp/hr-core-backend/supabase-server.js   src/lib/
cp /tmp/hr-core-backend/supabase-middleware.js src/lib/
DONE "lib/ actualizado"

# 2. Copiar middleware
LOG "Paso 2/8: Copiar middleware"
cp /tmp/hr-core-backend/middleware.js ./
DONE "middleware.js actualizado"

# 3. Copiar route handlers de auth
LOG "Paso 3/8: Copiar route handlers de auth"
mkdir -p src/app/api/auth/login src/app/api/auth/logout src/app/api/auth/register
cp /tmp/hr-core-backend/login/route.js    src/app/api/auth/login/
cp /tmp/hr-core-backend/logout/route.js   src/app/api/auth/logout/
cp /tmp/hr-core-backend/register/route.js src/app/api/auth/register/
DONE "API auth actualizado"

# 4. Instalar dependencias necesarias
LOG "Paso 4/8: Instalar jose, mysql2, bcryptjs"
npm install jose mysql2 bcryptjs --no-audit --no-fund 2>&1 | tail -3
DONE "Dependencias instaladas"

# 5. Verificar variables de entorno
LOG "Paso 5/8: Verificar .env.production"
ENV_FILE=".env.production"
NEED=()
[ -z "$(grep -E '^DATABASE_URL=' $ENV_FILE)" ] && NEED+=("DATABASE_URL")
[ -z "$(grep -E '^NEXTAUTH_SECRET=' $ENV_FILE)" ] && NEED+=("NEXTAUTH_SECRET")
[ -z "$(grep -E '^NEXTAUTH_URL=' $ENV_FILE)" ] && NEED+=("NEXTAUTH_URL")

if [ ${#NEED[@]} -gt 0 ]; then
  WARN "Faltan en .env.production: ${NEED[*]}"
  echo "  Agregando con valores por defecto..."
  grep -q "^DATABASE_URL=" $ENV_FILE || echo "DATABASE_URL=mysql://hrcore_app:HR_Core_2026!@127.0.0.1:3306/hrcore_db" >> $ENV_FILE
  grep -q "^NEXTAUTH_URL=" $ENV_FILE || echo "NEXTAUTH_URL=https://hrcore.com.mx" >> $ENV_FILE
  grep -q "^NEXTAUTH_SECRET=" $ENV_FILE || echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> $ENV_FILE
fi
DONE ".env.production verificado"

# 6. Detener y limpiar PM2
LOG "Paso 6/8: Detener proceso anterior"
pm2 delete all 2>/dev/null || true
DONE "Procesos PM2 anteriores eliminados"

# 7. Iniciar con PM2
LOG "Paso 7/8: Iniciar HR CORE con PM2"
if [ ! -f ecosystem.config.js ]; then
  cat > ecosystem.config.js <<'EOF'
module.exports = {
  apps: [{
    name: 'HR CORE',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    cwd: '/var/www/html',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    max_memory_restart: '500M',
    env: { NODE_ENV: 'production', PORT: 3000 }
  }]
};
EOF
fi
pm2 start ecosystem.config.js
pm2 save
sleep 6
DONE "HR CORE iniciado con PM2"

# 8. Verificar
LOG "Paso 8/8: Verificar el deploy"
HTTP_LOCAL=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3000/ 2>/dev/null)
HTTP_PUBLIC=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://hrcore.com.mx/ 2>/dev/null)
echo "  Local:   HTTP $HTTP_LOCAL"
echo "  Publica: HTTP $HTTP_PUBLIC"

# Probar el login via API
LOG "Test de login"
curl -s -X POST http://127.0.0.1:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ADMIN","password":"318088330"}' \
  -c /tmp/cookies.txt -o /tmp/login-resp.json 2>/dev/null
cat /tmp/login-resp.json 2>/dev/null | head -c 200
echo ""

# Mostrar resumen
echo ""
if [ "$HTTP_LOCAL" = "200" ] && [ "$HTTP_PUBLIC" = "200" ]; then
  echo -e "${GREEN}================================================${NC}"
  echo -e "${GREEN}  DEPLOY COMPLETADO                          ${NC}"
  echo -e "${GREEN}================================================${NC}"
  echo ""
  echo "  URL:        https://hrcore.com.mx"
  echo "  Login:      https://hrcore.com.mx/login"
  echo "  Email:      ADMIN (alias)  o  admin@hrcore.com.mx"
  echo "  Password:   318088330"
  echo ""
  echo "  Si el curl de login devolvio {\"ok\":true}, el login funciona."
else
  ERR "App no responde 200. Revisa pm2 logs."
  echo "  pm2 logs --lines 30"
fi
