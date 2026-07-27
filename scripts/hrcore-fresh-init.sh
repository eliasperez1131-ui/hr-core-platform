#!/bin/bash
# scripts/hrcore-fresh-init.sh
# ============================================================
#  HR CORE · Fresh init MySQL (DROP + CREATE + SEED)
# ============================================================
#  USO (en el VPS, UNA SOLA VEZ):
#    cd /var/www/html
#    bash scripts/hrcore-fresh-init.sh
# ============================================================
#  ⚠️  ESTE SCRIPT BORRA TODO EN hrcore_db Y LO RECREA
#  ⚠️  NO LO EJECUTES SI TIENES DATOS QUE NO TIENEN BACKUP
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

LOG()  { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $*"; }
WARN() { echo -e "${YELLOW}⚠${NC} $*"; }
DONE() { echo -e "${GREEN}✓${NC} $*"; }
ERR()  { echo -e "${RED}✗${NC} $*"; }

DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASS:-123456}"
DB_NAME="${DB_NAME:-hrcore_db}"
MYSQL_OPTS="-u$DB_USER -p$DB_PASS $DB_NAME"

LOG "=== HR CORE · Fresh init MySQL ==="
echo ""
WARN "Este script BORRA TODAS LAS TABLAS de $DB_NAME y las RECREA desde cero."
WARN "Si tienes datos que NO quieres perder, HAZ BACKUP primero:"
echo "   mysqldump -u$DB_USER -p'$DB_PASS' --databases $DB_NAME > /tmp/backup_antes_init.sql"
echo ""

read -p "¿Continuar y borrar todo? (escribe 'SI'): " CONFIRM
if [ "$CONFIRM" != "SI" ]; then
  echo "Cancelado."
  exit 0
fi

# ============================================================
#  1. DROP todas las tablas
# ============================================================
LOG ""
LOG "1. DROP todas las tablas existentes..."

mysql $MYSQL_OPTS -e "
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS share_links;
DROP TABLE IF EXISTS prospectos_pendientes;
DROP TABLE IF EXISTS facturas;
DROP TABLE IF EXISTS vacante_candidatos;
DROP TABLE IF EXISTS candidatos;
DROP TABLE IF EXISTS vacantes;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS workspaces_empresas;
DROP TABLE IF EXISTS blacklist;
DROP TABLE IF EXISTS candidato_empresas;
DROP TABLE IF EXISTS pagos;
DROP TABLE IF EXISTS empresas;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS solicitudes_pruebas;
DROP TABLE IF EXISTS prospectos;
SET FOREIGN_KEY_CHECKS=1;
" 2>&1 | grep -v "Using a password"

DONE "Tablas eliminadas"

# ============================================================
#  2. CREATE todas las tablas del esquema HR CORE
# ============================================================
LOG ""
LOG "2. CREATE el esquema HR CORE completo..."

# Aplicar el schema directamente
mysql $MYSQL_OPTS < /var/www/html/sql/hrcore_mysql_schema.sql 2>&1 | grep -v "Using a password" | tail -20

DONE "Esquema creado"

# ============================================================
#  3. Crear el Super Admin
# ============================================================
LOG ""
LOG "3. INSERT del Super Admin (con bcrypt)..."

# Verificar que bcryptjs está disponible
cd /var/www/html
if [ ! -d node_modules/bcryptjs ]; then
  WARN "Instalando bcryptjs..."
  npm install bcryptjs --no-audit --no-fund 2>&1 | tail -3
fi

# Generar el hash bcrypt con Node.js
ADMIN_HASH=$(node -e "
const bcrypt = require('bcryptjs');
bcrypt.hash('318088330', 12).then(h => process.stdout.write(h));
")

DONE "Hash bcrypt generado"

# Insertar el admin
mysql $MYSQL_OPTS -e "
INSERT INTO user_profiles (id, email, password_hash, nombre_completo, rol, workspace_id, activo, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@hrcore.com.mx',
  '$ADMIN_HASH',
  'Super Administrador HR CORE',
  'Super_Admin',
  NULL,
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  nombre_completo = VALUES(nombre_completo),
  updated_at = NOW();
" 2>&1 | grep -v "Using a password"

DONE "Super Admin insertado"

# ============================================================
#  4. Verificación final
# ============================================================
LOG ""
LOG "4. Verificando resultado..."

echo ""
echo "  Tablas creadas:"
mysql $MYSQL_OPTS -e "SHOW TABLES;" 2>&1 | grep -v "Using a password" | sed 's/^/    /'

echo ""
echo "  Super Admin creado:"
mysql $MYSQL_OPTS -e "
SELECT id, email, nombre_completo, rol, activo, created_at
FROM user_profiles
WHERE rol = 'Super_Admin'
LIMIT 5;
" 2>&1 | grep -v "Using a password" | sed 's/^/    /'

# ============================================================
#  Resumen
# ============================================================
LOG ""
echo "================================================"
echo "  FRESH INIT COMPLETADO"
echo "================================================"
echo ""
echo "  CREDENCIALES DEL SUPER ADMIN:"
echo "  ─────────────────────────────────────────"
echo "   Email:     admin@hrcore.com.mx"
echo "   Password:  318088330"
echo "   Rol:       Super_Admin"
echo ""
echo "  PRÓXIMOS PASOS:"
echo "  ─────────────────────────────────────────"
echo "  1. Edita .env.production con DATABASE_URL apuntando a MySQL"
echo "  2. Reinicia PM2:"
echo "     pm2 restart hr-core-frontend"
echo "  3. Login en https://hrcore.com.mx/login"
echo ""
echo "  Si quieres tener una empresa demo + coordinador, ejecuta:"
echo "     node scripts/seed-empresa-demo.js"
echo "================================================"
