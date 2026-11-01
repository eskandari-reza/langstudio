#!/usr/bin/env bash
# langstudio Lab - step 1: base setup of a FRESH Ubuntu 24.04 server.
# Run once, as root:   sudo bash 01-base-setup.sh
# It does NOT disable password login yet; that is step 2, after you tested the new user.
set -euo pipefail

if [[ $EUID -ne 0 ]]; then echo "Run this script as root."; exit 1; fi
. /etc/os-release
if [[ "${ID:-}" != "ubuntu" ]]; then echo "This script is written for Ubuntu."; exit 1; fi

DEPLOY_USER="${DEPLOY_USER:-deploy}"
SSH_PORT="${SSH_PORT:-22}"

echo "== 1/7  Public key for user '${DEPLOY_USER}'"
if [[ -z "${PUBKEY:-}" ]]; then
  read -r -p "Paste your SSH PUBLIC key (one line, starts with ssh-ed25519): " PUBKEY
fi
if [[ ! "$PUBKEY" =~ ^ssh-(ed25519|rsa)\ [A-Za-z0-9+/=]+(\ .*)?$ ]]; then
  echo "That does not look like a public key (it must start with ssh-ed25519 or ssh-rsa)."
  echo "Never paste the PRIVATE key. Aborting."
  exit 1
fi

echo "== 2/7  System update"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y ufw fail2ban unattended-upgrades curl ca-certificates gnupg git

echo "== 3/7  User '${DEPLOY_USER}'"
if ! id "$DEPLOY_USER" &>/dev/null; then
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
fi
usermod -aG sudo "$DEPLOY_USER"
echo "${DEPLOY_USER} ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/90-${DEPLOY_USER}"
chmod 440 "/etc/sudoers.d/90-${DEPLOY_USER}"
visudo -cf "/etc/sudoers.d/90-${DEPLOY_USER}"
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/${DEPLOY_USER}/.ssh"
AUTH="/home/${DEPLOY_USER}/.ssh/authorized_keys"
touch "$AUTH"
grep -qxF "$PUBKEY" "$AUTH" || echo "$PUBKEY" >> "$AUTH"
chown "$DEPLOY_USER:$DEPLOY_USER" "$AUTH"
chmod 600 "$AUTH"

echo "== 4/7  Docker"
if ! command -v docker &>/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<'JSON'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" }
}
JSON
systemctl enable docker
systemctl restart docker
usermod -aG docker "$DEPLOY_USER"

echo "== 5/7  Firewall (ufw)"
ufw default deny incoming
ufw default allow outgoing
ufw allow "${SSH_PORT}/tcp" comment 'ssh'
ufw allow 80/tcp comment 'http'
ufw allow 443/tcp comment 'https'
ufw allow 443/udp comment 'http3'
ufw --force enable

echo "== 6/7  fail2ban and automatic security updates"
cat > /etc/fail2ban/jail.d/sshd.local <<EOF2
[sshd]
enabled = true
port = ${SSH_PORT}
backend = systemd
maxretry = 5
findtime = 10m
bantime = 1h
EOF2
systemctl enable fail2ban
systemctl restart fail2ban
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF3'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF3

echo "== 7/7  Folders"
install -d -m 755 -o "$DEPLOY_USER" -g "$DEPLOY_USER" /opt/langstudio /opt/langstudio/backups

echo
echo "Base setup finished."
echo "Leftover desktop services (should print nothing):"
systemctl list-unit-files 2>/dev/null | grep -E 'xrdp|cups|gdm|lightdm' || true
echo
echo "NEXT: open a SECOND terminal window and test:  ssh -i <your private key> ${DEPLOY_USER}@<server-ip>"
echo "Only if that works, run 02-lockdown-ssh.sh. Do not close this root session before that."
