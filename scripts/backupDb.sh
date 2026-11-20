#!/bin/sh
# Nightly encrypted pg_dump, upload off-server, keep 30 days. TODO: wire storage target.
set -eu
STAMP=$(date +%Y%m%d-%H%M%S)
pg_dump "$DATABASE_URL" -Fc | gpg --symmetric --batch --passphrase "$BACKUP_PASSPHRASE" > "/backups/pda-$STAMP.dump.gpg"
find /backups -name 'pda-*.dump.gpg' -mtime +30 -delete
