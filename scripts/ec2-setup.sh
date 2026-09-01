#!/usr/bin/env bash
# First-time setup on an Ubuntu EC2 instance (Amazon Ubuntu 22.04/24.04 AMI).
# Run as the ubuntu user after SSH-ing in:
#   curl -fsSL ...  or copy this file and: bash scripts/ec2-setup.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/notes-management}"
REPO_URL="${REPO_URL:-https://github.com/Deep95y/notes-management.git}"

if [[ "$(id -u)" -eq 0 ]]; then
  echo "Run this as a sudo-capable user (ubuntu), not as root."
  exit 1
fi

sudo apt-get update -y
sudo apt-get install -y ca-certificates curl git

if ! command -v docker >/dev/null 2>&1; then
  sudo install -m 0755 -d /etc/apt/keyrings
  sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  sudo chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${VERSION_CODENAME}") stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
  sudo apt-get update -y
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

sudo usermod -aG docker "$USER"

if [[ ! -d "${APP_DIR}/.git" ]]; then
  sudo mkdir -p "$(dirname "${APP_DIR}")"
  sudo git clone "${REPO_URL}" "${APP_DIR}"
  sudo chown -R "$USER:$USER" "${APP_DIR}"
fi

cd "${APP_DIR}"
cp -n .env.example .env || true

# Compose publishes APP_PORT on the host. On EC2 use port 80 so users hit http://<public-ip>/
sed -i 's/^APP_PORT=.*/APP_PORT=80/' .env

echo
echo "Docker is installed. Log out and SSH back in so the docker group applies."
echo "Then from ${APP_DIR} run:"
echo "  docker compose up -d --build"
echo
echo "Security group: allow TCP 22 from your IP, TCP 80 from 0.0.0.0/0."
echo "Do not open 27017 or 5000 to the internet."
