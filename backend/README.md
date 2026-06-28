# S3 Explorer — Backend

Node.js Express API server that handles AWS S3 operations via session-based authentication.

## Tech Stack

- Node.js 22
- Express 4
- AWS SDK v3
- express-session (cookie-based sessions)
- Busboy (multipart file uploads)
- TypeScript

## Run Locally

```bash
npm install
npm run dev
```

Server runs on http://localhost:8090

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |

## Run with Docker

```bash
docker build -t s3-explorer-backend .
docker run -p 8090:8090 -e SESSION_SECRET=your-secret s3-explorer-backend
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| SESSION_SECRET | No | `s3-explorer-dev-secret` | Signs session cookies |
| PORT | No | `8090` | Server port |
| S3_PROFILES | No | — | JSON array of pre-configured profiles |

### S3_PROFILES format

```json
[
  {
    "name": "production",
    "access_key": "AKIA...",
    "secret_key": "wJal...",
    "region": "us-east-1",
    "bucket_name": "my-bucket",
    "base_path": ""
  }
]
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/profiles | List available profile names |
| POST | /api/connect | Connect with manual credentials |
| POST | /api/connect-profile | Connect using a saved profile |
| DELETE | /api/disconnect | Clear session |
| GET | /api/browse?prefix= | List folders and files |
| POST | /api/upload | Upload files (multipart) |
| POST | /api/upload-folder | Upload folder with paths (multipart) |
| GET | /api/download?key= | Download a file |
| GET | /api/read?key= | Read file content as text |
| POST | /api/write | Write/update file content |
| DELETE | /api/delete | Delete files by keys |
| POST | /api/create-folder | Create an empty folder |
| POST | /api/rename | Rename a file or folder |
| GET | /api/resolve-path?path= | Resolve path to file or folder |

## Project Structure

```
backend/
├── index.ts        # Express app bootstrap
├── routes.ts       # All API route handlers
├── s3.ts           # AWS SDK v3 S3 client helpers
├── .env
├── Dockerfile
├── package.json
└── tsconfig.json
```
