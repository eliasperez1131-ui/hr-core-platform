#!/bin/bash
# scripts/configure-db.sh
# ============================================================
#  Configura la conexion MySQL en .env.production
#  y reinicia PM2
# ============================================================
#  USO:  bash /var/www/html/scripts/configure-db.sh
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
DONE() { echo -e "${GREEN}✓${NC} $*"; }
WARN() { echo -e "${YELLOW}⚠${NC} $*"; }

LOG()  { echo ""; echo "=== $* ==="; }

# 1. Crear usuario seguro de MySQL
LOG "Paso 1/4: Crear usuario seguro de MySQL"
mysql -uroot -p'123456' hrcore_db -e "
CREATE USER IF NOT EXISTS 'hrcore_app'@'localhost' IDENTIFIED BY 'HR_Core_2026!';
GRANT ALL PRIVILEGES ON hrcore_db.* TO 'hrcore_app'@'localhost';
FLUSH PRIVILEGES;"
DONE "Usuario 'hrcore_app'@'localhost' creado con permisos sobre hrcore_db"

# 2. Actualizar .env.production
LOG "Paso 2/4: Actualizar .env.production"
ENV_FILE="/var/www/html/.env.production"
BACKUP="${ENV_FILE}.bak.$(date +%Y%m%d-%H%M%S)"
cp "$ENV_FILE" "$BACKUP"
DONE "Backup: $BACKUP"

# Reemplazar DATABASE_URL (o agregarla si no existe)
if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=mysql://hrcore_app:HR_Core_2026!@127.0.0.1:3306/hrcore_db|" "$ENV_FILE"
  DONE "DATABASE_URL actualizada"
else
  echo "DATABASE_URL=mysql://hrcore_app:HR_Core_2026!@127.0.0.1:3306/hrcore_db" >> "$ENV_FILE"
  DONE "DATABASE_URL agregada"
fi

# Mostrar la nueva DATABASE_URL (sin password)
grep "^DATABASE_URL" "$ENV_FILE" | sed 's|://[^@]*@|://***@|'

# 3. Reiniciar PM2
LOG "Paso 3/4: Reiniciar PM2"
pm2 restart hr-core-frontend
sleep 4
DONE "PM2 reiniciado"

# 4. Verificar
LOG "Paso 4/4: Verificar conexion"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3000/)
echo "  Local HTTP:   $HTTP"
HTTP2=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://hrcore.com.mx/)
echo "  Publica HTTP: $HTTP2"

if [ "$HTTP" = "200" ] || [ "$HTTP2" = "200" ]; then
  echo ""
  echo -e "${GREEN}================================================${NC}"
  echo -e "${GREEN}  ✓ SISTEMA LISTO                         ${NC}"
  echo -e "${GREEN}================================================${NC}"
  echo ""
  echo "  URL:        https://hrcore.com.mx"
  echo "  Login:      admin@hrcore.com.mx"
  echo "  Password:   318088330"
  echo ""
  echo "  Si hay error 500, revisa:"
  echo "    pm2 logs hr-core-frontend --lines 30"
fi
