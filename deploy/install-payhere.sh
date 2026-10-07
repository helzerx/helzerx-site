#!/usr/bin/env bash
set -euo pipefail

APP=${APP:-/var/www/arvex}
SERVICE_SRC="$APP/deploy/arvex-automation.service"
SERVICE_DST=/etc/systemd/system/arvex-payhere.service
NGINX_MARKER='location ^~ /api/payments/'

if [[ ! -f "$APP/.env" ]]; then
  echo "ERROR: $APP/.env does not exist. Create it first."
  exit 1
fi

required=(PAYHERE_MERCHANT_ID PAYHERE_MERCHANT_SECRET PAYHERE_SANDBOX PAYHERE_PORT PUBLIC_ORIGIN)
for key in "${required[@]}"; do
  if ! grep -qE "^${key}=" "$APP/.env"; then
    echo "ERROR: Missing $key in .env"
    exit 1
  fi
done

chmod 600 "$APP/.env"
mkdir -p "$APP/data"
chmod 700 "$APP/data"

install -m 0644 "$SERVICE_SRC" "$SERVICE_DST"
systemctl daemon-reload
systemctl enable arvex-payhere.service
systemctl restart arvex-payhere.service

echo "PayHere installation files are installed. Configure Nginx separately for your active PUBLIC_ORIGIN."
