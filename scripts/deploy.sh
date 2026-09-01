#!/usr/bin/env bash
# Manual deploy on the EC2 host (CI does the same thing automatically).
set -euo pipefail

cd /opt/notes-management
git pull --ff-only origin main
docker compose pull
docker compose up -d --remove-orphans
docker compose ps
