#!/bin/sh
# Restore a backup into a scratch database (quarterly restore test).
set -eu
FILE=$1
createdb pda_restore_test
gpg --decrypt --batch --passphrase "$BACKUP_PASSPHRASE" "$FILE" | pg_restore -d pda_restore_test --no-owner
