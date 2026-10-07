#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

APP="${APP:-/var/www/arvex}"
REPO="${REPO:-https://github.com/helzerx/helzerx-site.git}"
BRANCH="${BRANCH:-main}"
API_PORT="${API_PORT:-3000}"
AUTOMATION_PORT="${AUTOMATION_PORT:-5001}"

R=$'\033[31m'; G=$'\033[32m'; Y=$'\033[33m'; C=$'\033[36m'; M=$'\033[35m'
B=$'\033[1m'; D=$'\033[2m'; X=$'\033[0m'
trap 'echo -e "\n${R}✖ Setup failed at line $LINENO${X}"; exit 1' ERR

[[ $EUID -eq 0 ]] || { echo "Run as root: sudo bash setup.sh"; exit 1; }
clear || true
echo -e "${C}${B}"
cat <<'ART'
██╗  ██╗███████╗██╗     ███████╗██████╗ ██╗  ██╗
██║  ██║██╔════╝██║     ╚══███╔╝██╔══██╗╚██╗██╔╝
███████║█████╗  ██║       ███╔╝ ██████╔╝ ╚███╔╝
██╔══██║██╔══╝  ██║      ███╔╝  ██╔══██╗ ██╔██╗
██║  ██║███████╗███████╗███████╗██║  ██║██╔╝ ██╗
╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
ART
echo -e "${X}${D}                 CLOUD • 3D PRODUCTION SETUP${X}"

cube=(
'       +------+      +------+\n      /      /|     /      /|\n     +------+ |    +------+ |\n     |      | +    |      | +\n     |      |/     |      |/\n     +------+      +------+'
'          /\\n         /  \\\n    _____/____\\_____\n   /    /    /    /|\n  +----+----+----+ |\n  |    |    |    | /\n  +----+----+----+/'
'       +-----------+\n      /|          /|\n     / |         / |\n    +--+--------+  |\n    |  |        |  |\n    |  +--------|--+\n    | /         | /\n    |/          |/\n    +-----------+'
)
for i in 0 1 2 0 1 2; do
  printf "\033[11A\033[2K"; printf "%b\n" "${M}${cube[$i]}${X}"; sleep .10
done
echo

log(){ echo -e "  ${G}✔${X} $*"; }
ask(){ local p="$1" d="$2" v; read -r -p "  $p [$d]: " v; printf '%s' "${v:-$d}"; }
ask_secret(){ local p="$1" d="$2" v; read -r -s -p "  $p [hidden]: " v; echo; printf '%s' "${v:-$d}"; }

echo -e "\n${B}${C}[1/6] SYSTEM${X}"
apt-get update -qq
apt-get install -y -qq ca-certificates curl git build-essential openssl nginx >/dev/null
if ! command -v node >/dev/null || (( $(node -p 'process.versions.node.split(".")[0]') < 22 )); then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
fi
log "Node $(node -v), npm $(npm -v)"

echo -e "\n${B}${C}[2/6] SOURCE${X}"
mkdir -p "$(dirname "$APP")"
if [[ -d "$APP/.git" ]]; then
  git -C "$APP" fetch origin "$BRANCH" --quiet
  git -C "$APP" reset --hard "origin/$BRANCH" --quiet
else
  git clone --branch "$BRANCH" --depth 1 "$REPO" "$APP" >/dev/null
fi
log "HelzerX source ready at $APP"

echo -e "\n${B}${C}[3/6] ENVIRONMENT WIZARD${X}"
mkdir -p "$APP/data/automation"
umask 077
if [[ -f "$APP/.env" ]]; then
  cp "$APP/.env" "$APP/.env.backup.$(date +%Y%m%d-%H%M%S)"
  log "Existing .env backed up"
fi
PUBLIC_ORIGIN=$(ask "Public HTTPS origin" "https://example.com")
ADMIN_EMAIL=$(ask "Admin email" "admin@example.com")
ADMIN_PASSWORD=$(ask_secret "Admin password" "$(openssl rand -base64 18)")
PTERODACTYL_URL=$(ask "Pterodactyl URL" "https://panel.example.com")
GOOGLE_CLIENT_ID=$(ask "Google Client ID (optional)" "")
GOOGLE_CLIENT_SECRET=$(ask_secret "Google Client Secret (optional)" "")
DISCORD_BOT_TOKEN=$(ask_secret "Discord Bot Token (optional)" "")
DISCORD_GUILD_ID=$(ask "Discord Guild ID (optional)" "")
DISCORD_STAFF_ROLE_ID=$(ask "Discord Staff Role ID (optional)" "")
DISCORD_TICKET_CATEGORY_ID=$(ask "Discord Ticket Category ID (optional)" "")
RESEND_API_KEY=$(ask_secret "Resend API Key (optional)" "")
RESEND_FROM=$(ask "Resend From (optional)" "")
PAYHERE_MERCHANT_ID=$(ask "PayHere Merchant ID (optional)" "")
PAYHERE_MERCHANT_SECRET=$(ask_secret "PayHere Merchant Secret (optional)" "")
PAYHERE_SANDBOX=$(ask "PayHere Sandbox" "true")
PAYHERE_USD_TO_LKR=$(ask "USD to LKR rate" "300")

cat > "$APP/.env" <<EOF
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
ADMIN_TOKEN_SECRET=$(openssl rand -hex 48)
ARVEX_AUTOMATION_DATA_DIR=$APP/data/automation
AUTOMATION_INTERNAL_SECRET=$(openssl rand -hex 32)
DISCORD_BOT_TOKEN=$DISCORD_BOT_TOKEN
DISCORD_GUILD_ID=$DISCORD_GUILD_ID
DISCORD_STAFF_ROLE_ID=$DISCORD_STAFF_ROLE_ID
DISCORD_TICKET_CATEGORY_ID=$DISCORD_TICKET_CATEGORY_ID
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=$PUBLIC_ORIGIN/api/auth/google/callback
INTERNAL_API_ORIGIN=http://127.0.0.1:$API_PORT
PAYHERE_MERCHANT_ID=$PAYHERE_MERCHANT_ID
PAYHERE_MERCHANT_SECRET=$PAYHERE_MERCHANT_SECRET
AUTOMATION_PORT=$AUTOMATION_PORT
PAYHERE_SANDBOX=$PAYHERE_SANDBOX
PAYHERE_USD_TO_LKR=$PAYHERE_USD_TO_LKR
PTERODACTYL_ALLOCATION_ID=0
PTERODACTYL_APPLICATION_TOKEN=
PTERODACTYL_DOCKER_IMAGE=ghcr.io/pterodactyl/yolks:java_21
PTERODACTYL_EGG_ID=1
PTERODACTYL_LOCATION_ID=1
PTERODACTYL_NEST_ID=1
PTERODACTYL_NODE_ID=1
PTERODACTYL_STARTUP=java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}
PTERODACTYL_URL=$PTERODACTYL_URL
PUBLIC_ORIGIN=$PUBLIC_ORIGIN
RESEND_API_KEY=$RESEND_API_KEY
RESEND_FROM=$RESEND_FROM
EOF
chmod 600 "$APP/.env"
chmod 700 "$APP/data" "$APP/data/automation"
log ".env generated securely"

echo -e "\n${B}${C}[4/6] BUILD${X}"
cd "$APP"
npm ci --no-audit --no-fund >/dev/null
npm run lint >/dev/null
npm run build >/dev/null
log "Dependencies + typecheck + production build passed"

echo -e "\n${B}${C}[5/6] SERVICES${X}"
cat > /etc/systemd/system/helzerx-api.service <<EOF
[Unit]
Description=HelzerX Cloud API
After=network-online.target
Wants=network-online.target
[Service]
Type=simple
User=root
WorkingDirectory=$APP
EnvironmentFile=$APP/.env
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/helzerx-automation.service <<EOF
[Unit]
Description=HelzerX Cloud Automation
After=network-online.target helzerx-api.service
Wants=network-online.target
[Service]
Type=simple
User=root
WorkingDirectory=$APP
EnvironmentFile=$APP/.env
ExecStart=/usr/bin/npm run start:automation
Restart=always
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
ReadWritePaths=$APP/data
[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now helzerx-api.service helzerx-automation.service >/dev/null
sleep 2

echo -e "\n${B}${C}[6/6] HEALTH${X}"
curl -fsS --max-time 10 "http://127.0.0.1:$API_PORT/api/health" >/dev/null
log "API online :$API_PORT"
curl -fsS --max-time 10 "http://127.0.0.1:$AUTOMATION_PORT/health" >/dev/null
log "Automation online :$AUTOMATION_PORT"

echo
printf '%b\n' "${G}${B}╔══════════════════════════════════════════════════════╗"
printf '%b\n' "║              HELZERX CLOUD READY ✓                  ║"
printf '%b\n' "╚══════════════════════════════════════════════════════╝${X}"
echo -e "${D}App: $APP\nEnv: $APP/.env\nAPI: http://127.0.0.1:$API_PORT\nAutomation: http://127.0.0.1:$AUTOMATION_PORT${X}"
echo -e "${Y}Next: point Nginx/Cloudflare Tunnel to port $API_PORT.${X}"
