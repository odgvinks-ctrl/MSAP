#!/bin/sh
set -e

if [ ! -f /data/secrets.yaml ]; then
  python - <<'PY'
import os, secrets
with open("/data/secrets.yaml", "w") as f:
    f.write(f"registration_shared_secret: \"{secrets.token_urlsafe(32)}\"\n")
    f.write(f"macaroon_secret_key: \"{secrets.token_urlsafe(32)}\"\n")
    f.write(f"form_secret: \"{secrets.token_urlsafe(32)}\"\n")
    f.write("database:\n")
    f.write("  name: psycopg2\n")
    f.write("  args:\n")
    f.write("    user: synapse\n")
    f.write(f"    password: \"{os.environ['SYNAPSE_DB_PASSWORD']}\"\n")
    f.write("    database: synapse\n")
    f.write("    host: db\n")
    f.write("    cp_min: 2\n")
    f.write("    cp_max: 10\n")
PY
  chmod 600 /data/secrets.yaml
fi

python -m synapse.app.homeserver --config-path /config/homeserver.yaml --config-path /data/secrets.yaml --generate-keys
exec python -m synapse.app.homeserver --config-path /config/homeserver.yaml --config-path /data/secrets.yaml
