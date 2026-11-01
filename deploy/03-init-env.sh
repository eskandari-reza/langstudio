#!/usr/bin/env bash
# Creates /opt/langstudio/.env with fresh random secrets. Run once on the server as the deploy user.
set -euo pipefail
ENV_FILE=/opt/langstudio/.env
if [[ -e "$ENV_FILE" ]]; then
  echo "$ENV_FILE already exists; leaving it untouched."
  exit 0
fi
umask 077
cat > "$ENV_FILE" <<EOF2
POSTGRES_PASSWORD=$(openssl rand -hex 24)
AUTH_SECRET=$(openssl rand -base64 32)
AUTH_URL=https://langstudio.ir
AUTH_MODE=dev
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
IMAGE_TAG=latest
EOF2
chmod 600 "$ENV_FILE"
echo "Created $ENV_FILE (secrets are random and stay only on this server)."
echo "Fill GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET later with:  nano $ENV_FILE"
