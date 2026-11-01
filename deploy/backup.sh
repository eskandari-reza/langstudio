#!/usr/bin/env bash
# Nightly database dump (kept 7 days). Install the cron job once:
#   ( crontab -l 2>/dev/null; echo "0 3 * * * /opt/langstudio/backup.sh >> /opt/langstudio/backups/backup.log 2>&1" ) | crontab -
set -euo pipefail
DIR=/opt/langstudio/backups
mkdir -p "$DIR"
FILE="$DIR/langstudio-$(date +%F).sql.gz"
docker exec langstudio-postgres pg_dump -U langstudio langstudio | gzip > "$FILE.tmp"
mv "$FILE.tmp" "$FILE"
chmod 600 "$FILE"
find "$DIR" -name 'langstudio-*.sql.gz' -mtime +7 -delete
echo "$(date -Is) backup ok: $FILE ($(du -h "$FILE" | cut -f1))"
