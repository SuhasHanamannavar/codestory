# CodeStory: TurnoverGuard

An AI-powered GitHub repository intelligence platform that transforms any codebase into visual stories, maps module ownership, and mitigates the "bus factor" through developer turnover simulation.

## 🚀 Key Features

### 1. Ownership & Risk Graphs (The "Bus Factor" Map)
- **What it does:** Analyzes the commit history of any GitHub repository to generate a dynamic, module-level dependency graph.
- **How it works:** It fetches up to 25 recent commits, tracks which developer touched which file, and aggregates this into module-level "ownership shares." 
- **Value:** Instantly visually identifies code silos—modules where a single developer holds the majority of the knowledge.

### 2. Resignation Simulation
- **What it does:** Allows you to select a developer and simulate the impact of them leaving the team tomorrow.
- **How it works:** Recalculates the risk scores of all modules owned by that developer, triggering a real-time, animated transition on the graph (modules turn red to indicate high risk/knowledge loss).
- **Value:** Provides a tangible, visual representation of knowledge risk to project managers and stakeholders.

### 3. Automated Rescue Playbooks
- **What it does:** Generates actionable handover documentation to mitigate the simulated risk.
- **How it works:** Once a resignation is simulated, the backend (via Groq/LLM integration) generates a 30-day transfer schedule, a technical handover playbook, and a client communication plan.
- **Value:** Turns a scary risk metric into a concrete, executable mitigation strategy.

### 4. Notion Integration
- **What it does:** Seamlessly exports the generated Rescue Playbooks to your company's Notion workspace.
- **How it works:** Uses the Notion API to create a structured document containing the impact map and the 30-day handover schedule.
- **Value:** Integrates directly into existing project management workflows.

### 5. Flexible GitHub Authentication
- **What it does:** Supports analyzing both public and private repositories.
- **Mode A (Server Token):** Uses an environment-level `GITHUB_TOKEN` for seamless public repository analysis without user login.
- **Mode B (OAuth):** Features a "Sign in with GitHub" flow, allowing users to authenticate and ingest private repositories they have access to.

### 6. Robust Background Processing
- **What it does:** Prevents UI freezing and timeouts when analyzing massive repositories.
- **How it works:** When `USE_BACKGROUND_INGEST=1`, the backend drops ingestion jobs into a Redis queue. A separate Python worker process picks up the job, processes the GitHub API calls, and saves the graph back to Redis. The React frontend actively polls for job completion.
- **Value:** Enterprise-grade reliability and UX.

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS, Vite, Cytoscape (for complex graph physics & visualization), Framer Motion (for fluid UI animations).
- **Backend:** FastAPI (high-performance Python API), HTTPX (async requests), Redis (queue/state management), PostgreSQL (database).
- **Infrastructure:** Docker, Docker Compose for simple 1-click deployments.

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
