#!/bin/bash
# Script de backup del VPS actual (MySQL con root/123456)
# Genera: /tmp/pre-hrcore-backup-<TIMESTAMP>.tar.gz en el VPS
# Para correr:
#   ssh root@177.7.33.146 'bash -s' < backup-vps.sh

set -e
mkdir -p /tmp/pre-hrcore-backup
cd /tmp/pre-hrcore-backup

echo "== Tipos de BD disponibles =="
which mysqldump pg_dump 2>/dev/null || true

echo ""
echo "== Listando bases de datos MySQL =="
mysql -uroot -p'123456' -e 'SHOW DATABASES;' 2>/dev/null

echo ""
echo "== Tamano de cada BD =="
mysql -uroot -p'123456' -e "SELECT table_schema, ROUND(SUM(data_length+index_length)/1024/1024, 2) AS 'MB' FROM information_schema.tables WHERE table_schema NOT IN ('mysql','information_schema','performance_schema','sys') GROUP BY table_schema;" 2>/dev/null

echo ""
echo "== Haciendo backup con mysqldump =="
mysqldump -uroot -p'123456' \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --add-drop-database \
  --databases \
  $(mysql -uroot -p'123456' -N -e "SHOW DATABASES" 2>/dev/null | grep -v -E '^(mysql|information_schema|performance_schema|sys)$' | tr '\n' ' ') \
  > full-mysql-dump.sql 2>/dev/null

ls -lh /tmp/pre-hrcore-backup/full-mysql-dump.sql

echo ""
echo "== Listando archivos de configuracion del VPS =="
{
  echo "/etc/os-release:"
  cat /etc/os-release 2>/dev/null
  echo ""
  echo "/var/www/:"
  ls -la /var/www/ 2>/dev/null
  echo ""
  echo "Servicios corriendo:"
  systemctl list-units --type=service --state=running --no-pager 2>/dev/null | head -20
  echo ""
  echo "Procesos Node/Java/PHP:"
  ps auxf 2>/dev/null | grep -E 'node|java|php|python' | grep -v grep | head -10
  echo ""
  echo "Docker (si esta):"
  docker ps 2>/dev/null
  echo ""
  echo "Crontab:"
  crontab -l 2>/dev/null
} > system-info.txt

echo ""
echo "== Compactando todo en un tar.gz =="
cd /tmp
TS=$(date +%Y%m%d-%H%M%S)
tar -czf pre-hrcore-backup-$TS.tar.gz pre-hrcore-backup/
ls -lh pre-hrcore-backup-$TS.tar.gz

echo ""
echo "== Backup listo =="
echo "Archivo: /tmp/pre-hrcore-backup-$TS.tar.gz"
echo "Tamano: $(du -h pre-hrcore-backup-$TS.tar.gz | cut -f1)"
