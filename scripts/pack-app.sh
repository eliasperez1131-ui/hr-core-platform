#!/bin/bash
# scripts/pack-app.sh
# ============================================================
#  Empaqueta HR CORE para subir al VPS (excluye node_modules, .next, logs)
# ============================================================
#  Genera: dist/hr-core-<TIMESTAMP>.tar.gz en la raíz del proyecto
# ============================================================

set -e

PROJ_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJ_DIR"

DIST="$PROJ_DIR/dist"
mkdir -p "$DIST"

TS=$(date +%Y%m%d-%H%M%S)
TARFILE="$DIST/hr-core-$TS.tar.gz"
LATEST="$DIST/hr-core-latest.tar.gz"

echo "=== Empaquetando HR CORE desde $PROJ_DIR ==="
echo "Destino: $TARFILE"
echo ""

# Tamaño aproximado del node_modules (lo que estamos excluyendo)
if [ -d node_modules ]; then
  NM_SIZE=$(du -sh node_modules | cut -f1)
  echo "  Excluyendo node_modules ($NM_SIZE)..."
fi

# Crear tar.gz excluyendo todo lo innecesario
tar --exclude='./node_modules' \
    --exclude='./.next' \
    --exclude='./.git' \
    --exclude='./.gitignore' \
    --exclude='./dist' \
    --exclude='./backups' \
    --exclude='./.env.local' \
    --exclude='./.env.production' \
    --exclude='./.next-env.d.ts' \
    --exclude='./.vercel' \
    --exclude='./.cache' \
    --exclude='./.vscode' \
    --exclude='./.idea' \
    --exclude='./node_modules' \
    --exclude='./.next' \
    --exclude='./*.log' \
    --exclude='./*.tsbuildinfo' \
    --exclude='./package-lock.json' \
    --exclude='./scripts/backup-mysql-now.ps1' \
    --exclude='./scripts/inspect-vps.ps1' \
    --exclude='./scripts/detect-vps.sh' \
    --exclude='./scripts/expect-ssh.ps1' \
    --exclude='./scripts/expect-ssh.ps1' \
    --exclude='./scripts/total-rebuild.sh' \
    --exclude='./scripts/surgical-deploy.sh' \
    --exclude='./scripts/manual-deploy.sh' \
    --exclude='./scripts/pack-app.sh' \
    --exclude='./DEPLOY.md' \
    --exclude='./DEPLOY-VPS.md' \
    --exclude='./.git/COMMIT_EDITMSG' \
    --exclude='./.git/ORIG_HEAD' \
    --exclude='./ROADMAP-VPS.md' \
    --exclude='./hrcore_db.sql' \
    -czf "$TARFILE" \
    --transform 's,^\./,,' \
    .

if [ ! -f "$TARFILE" ]; then
  echo "✗ Error: no se pudo crear el tarball"
  exit 1
fi

# Crear también un "latest" symlink (en Windows se copia)
cp "$TARFILE" "$LATEST" 2>/dev/null || true

# Mostrar resultado
TAR_SIZE=$(du -sh "$TARFILE" | cut -f1)
FILE_COUNT=$(tar -tzf "$TARFILE" | wc -l)

echo ""
echo "=== RESULTADO ==="
echo "  Archivo: $TARFILE"
echo "  Tamaño:  $TAR_SIZE"
echo "  Archivos: $FILE_COUNT"
echo "  Latest: $LATEST"
echo ""
echo "=== Siguiente paso ==="
echo "  # Subir al VPS:"
echo "  scp \"$TARFILE\" root@177.7.33.146:/tmp/"
echo ""
echo "  # En el VPS, extraer y continuar con manual-deploy.sh:"
echo "  ssh root@177.7.33.146"
echo "  cd /var/www/html"
echo "  tar -xzf /tmp/$(basename $TARFILE)"
echo "  bash /tmp/manual-deploy.sh"
