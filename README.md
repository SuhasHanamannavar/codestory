# CodeStory: TurnoverGuard

An AI-powered GitHub repository intelligence platform that transforms any codebase into visual stories, maps module ownership, and mitigates the "bus factor" through developer turnover simulation.

## 🚀 Key Features

- **Ownership & Risk Graphs:** Analyzes GitHub commit history to generate a module-level dependency and ownership graph. Identifies key bottlenecks and code silos.
- **Resignation Simulation:** "What if Alice leaves tomorrow?" Simulates the risk impact dynamically across your codebase.
- **Automated Rescue Playbooks:** Generates AI-driven handover schedules, technical transfer guides, and client communication plans.
- **Notion Integration:** Instantly export generated rescue plans to Notion.
- **GitHub OAuth Login:** Support for both public repositories (via server token) and private repositories (via user OAuth token).
- **Background Processing:** Robust asynchronous job queue utilizing Redis to handle large repository ingestions smoothly.

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS, Vite, Cytoscape (for graph visualization), Framer Motion
- **Backend:** FastAPI, Python, Redis, PostgreSQL, HTTPX
- **Infrastructure:** Docker, Docker Compose

## ⚙️ Getting Started

### Prerequisites
Create a `.env` file in the root directory:
```env
USE_BACKGROUND_INGEST=1
GITHUB_CLIENT_ID=your_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_oauth_app_client_secret
GITHUB_TOKEN=your_personal_access_token_for_public_fallback
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_notion_db_id
```

### Option 1: Run with Docker (Recommended)
The application is fully containerized with Postgres, Redis, a Backend API, an Ingestion Worker, and the Frontend UI.
```bash
docker compose up --build
```
Access the dashboard at `http://localhost:3000`.

### Option 2: Run Locally (No Docker)
If you don't have Docker installed, you can run the app in synchronous mode using the provided helper scripts. This bypasses Redis and Postgres.

**Windows:**
```powershell
.\run_local.bat
```

**Mac/Linux:**
```bash
./run_local.sh
```
Access the dashboard at `http://localhost:5173` (or the port specified by Vite).

## 📡 API Endpoints

- `POST /api/ingest` - Accepts `{ github_url }`, enqueues a job, and returns `{ status: "enqueued", job_id: "..." }`.
- `GET /api/job/{job_id}` - Polls the status of the ingestion job.
- `GET /api/graph/{job_id}` - Returns the finalized graph `{ nodes, edges }`.
- `POST /api/simulate_resignation` - Accepts `{ github_url, developer }`, returning `{ before, after, deltas }`.
- `POST /api/rescue_plan` - Accepts `{ github_url, developer }`, returning generated playbooks and schedules.
- `POST /api/notion/save` - Accepts `{ github_url, rescue_plan }` and exports to Notion.
- `GET /auth/github/start` & `/auth/github/callback` - OAuth flow endpoints.
