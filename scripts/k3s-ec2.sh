#!/usr/bin/env bash
# Optional: install k3s (lightweight Kubernetes) on the same Ubuntu EC2 box.
# Do this AFTER you are comfortable with Docker Compose on EC2.
#
#   bash scripts/k3s-ec2.sh
#
# Then:
#   sudo kubectl apply -k /opt/notes-management/k8s
#   sudo kubectl -n notes get pods,svc
#
# App URL: http://<ec2-public-ip>:30080
set -euo pipefail

if command -v k3s >/dev/null 2>&1; then
  echo "k3s is already installed."
  sudo k3s kubectl get nodes
  exit 0
fi

curl -sfL https://get.k3s.io | sh -

echo
echo "k3s is running. kubeconfig: /etc/rancher/k3s/k3s.yaml"
echo "  sudo kubectl apply -k /opt/notes-management/k8s"
echo "  sudo kubectl -n notes get pods,svc"
echo
echo "Open security group TCP 30080 (NodePort) to reach the frontend."
echo "If you previously bound host port 80 with Compose, stop it first:"
echo "  cd /opt/notes-management && docker compose down"
