#!/bin/bash
# scripts/detect-vps.sh
# Diagnostico READ-ONLY: que hay instalado, en que puerto corre la app,
# donde esta el reverse proxy (Nginx/Apache/Caddy).
# NO modifica NADA.

echo "=========================================="
echo "  DIAGNOSTICO DEL VPS - SOLO LECTURA"
echo "=========================================="
echo ""

echo "== SISTEMA OPERATIVO =="
cat /etc/os-release 2>/dev/null | head -3
echo ""

echo "== NGINX / APACHE / CADDY (cual esta activo?) =="
echo "Nginx:"
systemctl status nginx 2>/dev/null | head -3 || echo "  Nginx no instalado"
echo ""
echo "Apache:"
systemctl status apache2 2>/dev/null | head -3 || echo "  Apache no instalado"
echo ""
echo "Caddy:"
systemctl status caddy 2>/dev/null | head -3 || echo "  Caddy no instalado"
echo ""

echo "== ARCHIVOS DE CONFIG DEL PROXY (CRITICOS) =="
for cfg in /etc/nginx/sites-enabled/hrcore.com.mx.conf \
          /etc/nginx/conf.d/hrcore.com.mx.conf \
          /etc/apache2/sites-enabled/hrcore.com.mx.conf \
          /etc/apache2/sites-enabled/000-default.conf \
          /etc/caddy/Caddyfile \
          /etc/caddy/Caddyfile.d/hrcore.com.mx.conf; do
  if [ -f "$cfg" ]; then
    echo "ENCONTRADO: $cfg"
    echo "------ contenido ------"
    cat "$cfg"
    echo "------ fin ----------"
    echo ""
  fi
done
echo ""

echo "== DONDE APUNTA EL PROXY (proxy_pass / reverse_proxy) =="
for cfg in /etc/nginx/sites-enabled/*.conf \
          /etc/apache2/sites-enabled/*.conf \
          /etc/caddy/Caddyfile*; do
  if [ -f "$cfg" ]; then
    echo "--- $cfg ---"
    grep -E 'proxy_pass|reverse_proxy|localhost:[0-9]+|127.0.0.1:[0-9]+' "$cfg" 2>/dev/null | head -3
  fi
done
echo ""

echo "== PUERTOS EN ESCUCHA =="
ss -tlnp 2>/dev/null | grep -E 'LISTEN' | head -20
echo ""

echo "== APLICACIONES CORRIENDO (PM2, Docker, systemd) =="
echo "PM2 (si esta instalado):"
if command -v pm2 >/dev/null 2>&1; then
  pm2 list 2>/dev/null
  echo ""
  echo "PM2 startup script:"
  pm2 startup 2>/dev/null | head -3
  echo ""
  echo "PM2 dump file (config):"
  ls -la /etc/systemd/system/pm2* 2>/dev/null
else
  echo "  PM2 no instalado"
fi
echo ""

echo "Docker (si esta):"
if command -v docker >/dev/null 2>&1; then
  docker ps 2>/dev/null
  echo ""
  echo "Docker Compose files:"
  find / -name 'docker-compose*' 2>/dev/null | grep -v proc | head -5
else
  echo "  Docker no instalado"
fi
echo ""

echo "Node apps en systemd:"
systemctl list-units --type=service --state=running 2>/dev/null | grep -E 'node|hrcore|next' | head -5
echo ""

echo "== CARPETA DE LA APP ACTUAL =="
for dir in /var/www/hrcore \
          /var/www/html \
          /opt/hrcore \
          /home/*/hrcore \
          /srv/hrcore; do
  if [ -d "$dir" ]; then
    echo "ENCONTRADO: $dir"
    ls -la "$dir" | head -10
    echo ""
  fi
done
echo ""

echo "== CERTIFICADOS SSL DE LET'S ENCRYPT =="
ls -la /etc/letsencrypt/live/ 2>/dev/null
echo ""
for cert in /etc/letsencrypt/live/hrcore.com.mx/fullchain.pem; do
  if [ -f "$cert" ]; then
    echo "Cert encontrado: $cert"
    openssl x509 -in "$cert" -noout -subject -dates 2>/dev/null | head -5
  fi
done
echo ""

echo "== ARCHIVOS .env (sin imprimirlos, solo listing) =="
find / -name '.env' -not -path '*/node_modules/*' 2>/dev/null | head -10
find / -name '.env.production' 2>/dev/null | head -5
echo ""

echo "=========================================="
echo "  DIAGNOSTICO COMPLETO"
echo "=========================================="
echo "Pasame este output completo a Elias en OpenCode."
