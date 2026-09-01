# Notes Management System

A full-stack application for creating, viewing, editing, deleting, and searching notes.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** React, Vite, React Router
- **Containers:** Docker Compose (local + EC2). Kubernetes manifests included for learning.

## Can we use Kubernetes?

Yes. The same Docker images run on Compose and on Kubernetes.

For **this** app (3 services, one server, learning project), start with Compose on a single EC2 instance. That is a real production-style deploy and is what most small apps actually use.

Use Kubernetes next, on purpose, to learn it:

| Stage | Where | Why |
|-------|--------|-----|
| 1. Docker Compose locally | Your laptop | Learn images, networks, volumes, healthchecks |
| 2. GitHub Actions CI/CD | GitHub | Build, test, push images, deploy |
| 3. Compose on one EC2 | AWS | Cheapest real cloud deploy |
| 4. Kubernetes locally | Docker Desktop / minikube / kind | Pods, Services, probes, kubectl |
| 5. k3s on the same EC2 | AWS | Kubernetes on a VM you already have |
| 6. EKS (later) | AWS managed K8s | Skip until 1–5 feel easy. EKS costs extra and is more ops than this app needs. |

EKS is optional. k3s on EC2 teaches 90% of Kubernetes without the EKS bill.

## Prerequisites

- Node.js 18+ (only if you run without Docker)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Compose + optional Kubernetes)
- MongoDB local/Atlas only if you skip Docker

---

## Path A — Docker Compose (recommended first)

From the repo root:

```bash
docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080).

| Container | Role |
|-----------|------|
| `frontend` | nginx serves the React build and proxies `/api` + `/health` to the backend |
| `backend` | Express API |
| `mongo` | Database. Port is **not** published to the host |

Stop and wipe data:

```bash
docker compose down -v
```

Copy `.env.example` to `.env` if you want to change the published port or image names.

### What you are learning here

- One process per container
- Backend talks to Mongo with the Compose DNS name `mongo`
- Browser talks only to nginx (`:8080`). API calls stay on `/api/...` (see `frontend/src/services/api.js`)
- Healthchecks so Compose (and later Kubernetes) know when a service is ready

---

## Path B — Run without Docker (local Node)

### MongoDB

**Option A — Local MongoDB**

1. Install MongoDB Community Server from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Start the MongoDB service
3. Default connection: `mongodb://127.0.0.1:27017/notes_management`

**Option B — MongoDB Atlas**

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Set `MONGODB_URI` in `backend/.env`

### Backend

```bash
cd backend
npm install
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
npm run dev
```

Backend runs at `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` (Vite proxies `/api` to the backend).

### Core Debugging Task (optional)

```bash
cd core/buggy-code
npm install
npm start
```

---

## CI/CD (GitHub Actions)

Workflow: `.github/workflows/ci-cd.yml`

On every pull request and push:

1. Build all images
2. Start Compose
3. Hit `/health` and `/api/notes`

On push to `main`:

4. Push `backend` and `frontend` images to [GHCR](https://docs.github.com/en/packages/working-with-a-github-container-registry)
5. If you enable it, SSH to EC2 and roll forward

### GitHub setup

1. Repo **Settings → Actions → General**: allow GitHub Actions to create/push packages
2. After the first successful `publish` job, open **Packages** and set both images to **Public** (simplest for EC2 pulls). Private packages need a PAT with `read:packages` on the server.
3. Image names:

   - `ghcr.io/<your-github-user>/notes-management-backend`
   - `ghcr.io/<your-github-user>/notes-management-frontend`

### Enable EC2 deploy (after the instance exists)

Repo **Settings → Secrets and variables → Actions**:

| Type | Name | Value |
|------|------|--------|
| Secret | `EC2_HOST` | Public IP or DNS of the instance |
| Secret | `EC2_USER` | `ubuntu` on Ubuntu AMIs |
| Secret | `EC2_SSH_KEY` | Full PEM private key |
| Variable | `DEPLOY_TO_EC2` | `true` |

Until `DEPLOY_TO_EC2` is `true`, CI still builds and publishes images; it just skips SSH.

---

## Deploy on AWS EC2 (Compose)

Use a free-tier-friendly instance: **Ubuntu 22.04/24.04**, t2.micro/t3.micro, ~8 GB disk.

1. Create a key pair and a security group:

   - TCP **22** from your IP
   - TCP **80** from `0.0.0.0/0`
   - Do **not** open 27017 or 5000

2. SSH in and run:

```bash
git clone https://github.com/Deep95y/notes-management.git
cd notes-management
bash scripts/ec2-setup.sh
```

3. Log out and SSH back in (so the `docker` group applies), then:

```bash
cd /opt/notes-management
docker compose up -d --build
```

App URL: `http://<ec2-public-ip>/` (`APP_PORT=80` on the server).

After CI is enabled, every push to `main` pulls the new GHCR images and restarts Compose.

Manual deploy on the box: `bash scripts/deploy.sh`

---

## Path C — Kubernetes (learning)

Manifests live in `k8s/`. Service names match Compose (`mongo`, `backend`, `frontend`), so the frontend nginx config does not change.

### Local cluster (Docker Desktop Kubernetes, minikube, or kind)

```bash
docker compose build
kubectl apply -k k8s/overlays/local
kubectl -n notes get pods,svc
kubectl -n notes port-forward svc/frontend 8080:80
```

Open [http://localhost:8080](http://localhost:8080).

If the cluster cannot see images from your laptop Docker daemon:

```bash
# minikube
minikube image load notes-backend:local
minikube image load notes-frontend:local

# kind
kind load docker-image notes-backend:local
kind load docker-image notes-frontend:local
```

Docker Desktop Kubernetes shares the local image store; Compose-built `:local` tags usually work with `imagePullPolicy: IfNotPresent`.

### k3s on the same EC2 (after Compose feels comfortable)

Stop Compose first so port 80 is free if you later add Ingress. NodePort **30080** is used by default:

```bash
cd /opt/notes-management
docker compose down
bash scripts/k3s-ec2.sh
sudo kubectl apply -k /opt/notes-management/k8s
sudo kubectl -n notes get pods,svc
```

Open `http://<ec2-public-ip>:30080` and allow **TCP 30080** in the security group.

Optional Ingress: `sudo kubectl apply -f /opt/notes-management/k8s/ingress.yaml` (k3s already ships Traefik).

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notes | List notes. Query: `?search=term&tag=work` |
| GET | /api/notes/tags | List all unique tags |
| GET | /api/notes/:id | Get single note |
| POST | /api/notes | Create `{ title, content, tags?, pinned? }` |
| PUT | /api/notes/:id | Update note |
| PATCH | /api/notes/:id/pin | Toggle or set pin `{ pinned?: boolean }` |
| DELETE | /api/notes/:id | Delete note |
| GET | /health | Health check (includes Mongo status) |

## Features

### Core
- Create, read, update, delete notes
- Search by title, content, and tags
- Title validation (required, non-empty)
- Loading, empty, and error states
- Delete confirmation dialog
- Responsive UI
- Notes sorted by most recently updated (pinned notes first)

### Bonus
- **Tags** — comma-separated tags on create/edit, filter by tag on list page
- **Pin notes** — pin/unpin from list or detail view; pinned notes appear first
- **Auto-save** — edits auto-save 1 second after you stop typing (edit mode only)

## Project Structure

```
├── backend/                 # Express API + Dockerfile
├── frontend/                # React/Vite + nginx Dockerfile
├── docker-compose.yml       # mongo + backend + frontend
├── k8s/                     # Kubernetes manifests
├── scripts/                 # EC2 + k3s helpers
├── .github/workflows/       # CI/CD
└── core/buggy-code/
```
