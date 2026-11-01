#!/usr/bin/env bash
# langstudio Lab - step 2: disable root and password logins over SSH.
# Run as root, ONLY after you logged in as the deploy user with your key from another window.
set -euo pipefail

if [[ $EUID -ne 0 ]]; then echo "Run this script as root."; exit 1; fi
DEPLOY_USER="${DEPLOY_USER:-deploy}"
AUTH="/home/${DEPLOY_USER}/.ssh/authorized_keys"

if [[ ! -s "$AUTH" ]]; then
  echo "No key found for ${DEPLOY_USER}. Run 01-base-setup.sh first."; exit 1
fi
echo "This will disable root login and password login for SSH."
echo "Only key login as '${DEPLOY_USER}' will remain."
read -r -p "Did you successfully log in as ${DEPLOY_USER} with your key from another window? (yes/no) " ANSWER
if [[ "$ANSWER" != "yes" ]]; then echo "Cancelled. Nothing changed."; exit 1; fi

# The file starts with 00- on purpose: sshd keeps the FIRST value it reads, so this must win
# over files such as 50-cloud-init.conf.
cat > /etc/ssh/sshd_config.d/00-langstudio-hardening.conf <<EOF2
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AllowUsers ${DEPLOY_USER}
MaxAuthTries 3
LoginGraceTime 30
X11Forwarding no
ClientAliveInterval 60
ClientAliveCountMax 5
EOF2

sshd -t
systemctl reload ssh

echo
echo "Effective settings:"
sshd -T | grep -E '^(permitrootlogin|passwordauthentication|kbdinteractiveauthentication|allowusers) '
echo
echo "Done. Open ANOTHER new window and confirm you can still log in as ${DEPLOY_USER}."
echo "Then run:  sudo reboot   (a restart is pending after the updates)"
