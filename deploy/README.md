# deploy/

Everything needed to run langstudio Lab on one Ubuntu 24.04 server. No secrets are stored here.

Server scripts (run once, in this order):
1. `01-base-setup.sh` : new user, Docker, firewall, fail2ban, automatic updates.
2. `02-lockdown-ssh.sh` : disables root and password login (after testing step 1).
3. `03-init-env.sh` : creates /opt/langstudio/.env with random secrets.

Files used by the GitHub workflow (copied to /opt/langstudio on every deploy):
- `docker-compose.prod.yml`, `Caddyfile`, `backup.sh`

Keep these files with LF line endings (see `.gitattributes`).
