#!/usr/bin/env bash
set -euo pipefail

APP=/var/www/helzerx
SERVICE_SRC="$APP/deploy/arvex-automation.service"
SERVICE_DST=/etc/systemd/system/helzerx-automation.service
NGINX_MARKER='location ^~ /api/payments/'

if [[ ! -f "$APP/.env" ]]; then
  echo "ERROR: $APP/.env does not exist. Create it first."
  exit 1
fi

required=(PAYHERE_MERCHANT_ID PAYHERE_MERCHANT_SECRET PAYHERE_SANDBOX PUBLIC_ORIGIN)
for key in "${required[@]}"; do
  if ! grep -qE "^${key}=" "$APP/.env"; then
    echo "ERROR: Missing $key in .env"
    exit 1
  fi
done

if grep -qE '^PAYHERE_MERCHANT_ID="?"?$' "$APP/.env" || grep -qE '^PAYHERE_MERCHANT_SECRET="?"?$' "$APP/.env"; then
  echo "ERROR: PayHere Merchant ID/Secret are empty."
  exit 1
fi

chmod 600 "$APP/.env"
mkdir -p "$APP/data"
chmod 700 "$APP/data"

install -m 0644 "$SERVICE_SRC" "$SERVICE_DST"
systemctl daemon-reload
systemctl enable helzerx-automation.service
systemctl restart arvex-payhere.service

# Add the PayHere proxy to the active ArveX HTTPS server once, without destroying
# the existing Nginx configuration. The insertion is immediately before the
# first closing brace of the 443 server block containing server_name helzerx.cyou.
NGINX_FILE=""
for candidate in /etc/nginx/sites-enabled/helzerx.cyou /etc/nginx/sites-available/helzerx.cyou; do
  if [[ -f "$candidate" ]] && grep -q 'server_name arvex.host' "$candidate"; then
    NGINX_FILE="$candidate"
    break
  fi
done

if [[ -z "$NGINX_FILE" ]]; then
  echo "ERROR: Could not locate the ArveX Nginx configuration."
  systemctl status arvex-payhere --no-pager -l || true
  exit 1
fi

if ! grep -qF "$NGINX_MARKER" "$NGINX_FILE"; then
  cp "$NGINX_FILE" "$NGINX_FILE.backup-payhere-$(date +%Y%m%d-%H%M%S)"
  python3 - "$NGINX_FILE" <<'PY'
import sys
from pathlib import Path
p = Path(sys.argv[1])
s = p.read_text()
needle = '    listen 443 ssl;'
start = s.find(needle)
if start < 0:
    raise SystemExit('HTTPS server block not found')
brace = s.find('{', start)
depth = 0
end = None
for i in range(brace, len(s)):
    if s[i] == '{': depth += 1
    elif s[i] == '}':
        depth -= 1
        if depth == 0:
            end = i
            break
if end is None:
    raise SystemExit('Could not parse HTTPS server block')
block = s[start:end]
if 'server_name arvex.host' not in block:
    raise SystemExit('First HTTPS block is not ArveX')
location = '''\n    # ArveX PayHere payment service\n    location ^~ /api/payments/ {\n        proxy_pass http://127.0.0.1:5001;\n        proxy_http_version 1.1;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n        proxy_read_timeout 30s;\n        client_max_body_size 64k;\n    }\n'''
s = s[:end] + location + s[end:]
p.write_text(s)
PY
fi

nginx -t
systemctl reload nginx

cd "$APP"
npm install
npm run build
systemctl restart arvex-api.service
systemctl restart arvex-payhere.service
sleep 2

printf '\n=== PAYHERE SERVICE ===\n'
systemctl --no-pager --full status arvex-payhere.service || true
printf '\n=== PAYHERE HEALTH ===\n'
curl -fsS --max-time 5 http://127.0.0.1:5001/api/payments/health || true
printf '\n\n=== NGINX PAYHERE HEALTH ===\n'
curl -fsS --max-time 10 ${PUBLIC_ORIGIN}/api/payments/health || true
printf '\n\nPAYHERE INSTALLATION COMPLETE\n'
