# S3 Explorer — Frontend

React single-page application for browsing and managing S3 objects.

## Tech Stack

- React 18
- Vite 6
- TailwindCSS 3
- React Router 6
- Sonner (toast notifications)
- Material Symbols Outlined (icon font)
- TypeScript

## Run Locally

```bash
npm install
npm run dev
```

UI runs on http://localhost:4176

The Vite dev server proxies `/api` requests to the backend at http://localhost:8090. Make sure the backend is running.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |

## Run with Docker

```bash
docker build -t s3-explorer-frontend .
docker run -p 4176:80 s3-explorer-frontend
```

The nginx container proxies `/api` to a backend service named `backend` on port 8090. Use with docker-compose or ensure the backend is reachable at that address.

## Design System

- Color palette: Coral primary, Sage secondary, Warm Amber tertiary
- Tokens defined in `src/index.css` using oklch color space
- Material Symbols Outlined loaded via Google Fonts CDN
- Dark mode via `.dark` class on `<html>`
- Elevation system: `shadow-elev-1` through `shadow-elev-5`
- Components: Icon, Button, IconButton, Chip, TextField, Scrim

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── dialogs/         # Modal dialogs (Rename, Delete, Editor, Upload, NewFolder)
│   │   ├── Icon.tsx         # Material Symbols wrapper
│   │   ├── Button.tsx       # MD3 button variants
│   │   ├── Chip.tsx         # Tonal chips
│   │   ├── TextField.tsx    # MD3 filled text field
│   │   ├── Scrim.tsx        # Modal backdrop
│   │   ├── TopAppBar.tsx    # App header with search
│   │   ├── FolderTree.tsx   # Left navigation panel
│   │   ├── FileList.tsx     # File/folder list with actions
│   │   └── ContentPreview.tsx  # Right panel file viewer
│   ├── lib/
│   │   ├── api.ts           # API client (fetch wrapper)
│   │   └── fileTypes.ts     # File type detection + formatting
│   ├── pages/
│   │   ├── LoginPage.tsx    # Connection screen
│   │   └── BrowserPage.tsx  # Main file explorer
│   ├── App.tsx
│   ├── index.css            # M3 design tokens
│   └── main.tsx
├── index.html
├── nginx.conf               # Production nginx config
├── Dockerfile
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```
