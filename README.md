# Notes Management System

A full-stack application for creating, viewing, editing, deleting, and searching notes.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** React, Vite, React Router

## Prerequisites

- Node.js 18+
- MongoDB (local install or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)

## MongoDB Setup

Yes, you need MongoDB for this project. The backend stores notes in a database.

**Option A — Local MongoDB**

1. Install MongoDB Community Server from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Start the MongoDB service (on Windows, it usually runs as a service after install)
3. Default connection: `mongodb://127.0.0.1:27017/notes_management`

**Option B — MongoDB Atlas (cloud, no local install)**

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/notes_management`)
3. Set it in `backend/.env` as `MONGODB_URI`

## Getting Started

### 1. Backend

```bash
cd notes-management/backend
npm install
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
npm run dev
```

Backend runs at `http://localhost:5000`

### 2. Frontend

```bash
cd notes-management/frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### 3. Core Debugging Task (optional run)

```bash
cd notes-management/core/buggy-code
node debugging-assignment.js
```

Runs a standalone Express server on port 3000 with all bugs fixed.

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
| GET | /health | Health check |

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
notes-management/
├── backend/
│   └── src/
│       ├── index.js
│       ├── models/Note.js
│       ├── routes/notes.js
│       └── middleware/errorHandler.js
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       └── services/api.js
└── core/
    └── buggy-code/
        └── debugging-assignment.js   ← fixed core debugging task
```

