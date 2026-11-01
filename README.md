# deploy/

Server scripts for langstudio Lab. They contain no secrets.

1. `01-base-setup.sh` : new user, Docker, firewall, fail2ban, automatic updates.
2. `02-lockdown-ssh.sh` : disables root and password login (run after testing step 1).

Keep these files with LF line endings (see `.gitattributes`).
