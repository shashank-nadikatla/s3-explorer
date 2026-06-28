# S3 Explorer

A web-based AWS S3 file explorer. Browse, preview, edit, upload, download, rename, and delete S3 objects.

## Project Structure

```
s3-explorer/
├── backend/          # Node.js Express API server
├── frontend/         # React + Vite + TailwindCSS UI
├── docker-compose.yml
├── Dockerfile        # Full-stack single container
└── README.md
```

## Prerequisites

- Node.js 22+
- npm 10+
- Docker (optional, for containerized deployment)

## Run Locally

You need two terminals — one for backend, one for frontend.

### Terminal 1: Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on http://localhost:8090

### Terminal 2: Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:4176

Open http://localhost:4176 in your browser. The Vite dev server proxies all `/api` requests to the backend automatically.

## Run with Docker

### Option 1: Docker Compose — pull from Docker Hub (recommended)

No source code needed. Just the `docker-compose.yml` and a `.env` file in the same folder.

```bash
docker compose up -d
```

This pulls pre-built images from Docker Hub (`shashanknadikatla/s3-explorer-backend` and `shashanknadikatla/s3-explorer-frontend`).

- Frontend: http://localhost:4176
- Backend: http://localhost:8090

To stop:

```bash
docker compose down
```

To update to latest images:

```bash
docker compose pull
docker compose up -d
```

### Option 2: Build from source with Docker Compose

If you want to build images locally from the source code:

```bash
docker compose -f docker-compose.build.yml up --build
```

### Option 3: Individual containers

Build and run each image separately.

```bash
# Backend
docker build -t s3-explorer-backend ./backend
docker run -p 8090:8090 --env-file .env s3-explorer-backend

# Frontend
docker build -t s3-explorer-frontend ./frontend
docker run -p 4176:80 s3-explorer-frontend
```

### Option 4: Full-stack single container

Backend serves the frontend static files from one container.

```bash
docker build -t s3-explorer .
docker run -p 8090:8090 --env-file .env s3-explorer
```

Access at http://localhost:8090

## Environment Variables

Set these in `backend/.env` or pass via Docker `-e` flags:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| SESSION_SECRET | No | `s3-explorer-dev-secret` | Signs session cookies |
| PORT | No | `8090` | Backend server port |
| S3_PROFILES | No | — | JSON array of pre-configured AWS profiles |

AWS credentials are entered by the user at runtime through the login form.

## Features

- Connect via saved profiles or manual AWS credentials
- Browse files and folders with breadcrumb navigation
- Search/filter files or navigate by full path
- Preview text files with syntax highlighting
- Edit and save files directly
- Create new files and folders
- Rename files and folders
- Delete with multi-select and confirmation
- Upload files via drag-and-drop or file picker
- Upload entire folders preserving structure
- Download files
- Session management with auto-expiry
- Toast notifications for all operations
- Responsive design (desktop + mobile)
- Dark mode support
