# CodeStory

AI-powered GitHub repo intelligence platform - Transform any codebase into visual stories

## Tech Stack

- **Frontend:** React + Tailwind CSS
- **Backend:** FastAPI (main.py)

## Get Started

```bash
# Backend (port 8000)
cd backend && pip install -r requirements.txt && python main.py

# Frontend (port 3000)
cd frontend && npm install && npm run dev
```

## Demo Dashboard

The main demo UI is now the dashboard at `/` (graph + resignation simulation + playbooks + Notion save).

During integration, the dashboard expects these backend endpoints:

- `POST /api/ingest` `{ github_url }` → `{ nodes, edges }`
- `POST /api/simulate_resignation` `{ github_url, developer }` → `{ before:{nodes,edges}, after:{nodes,edges}, deltas:[...] }`
- `POST /api/rescue_plan` `{ github_url, developer }` → `{ impact_map, transfer_schedule_30d, playbooks:{technical,client} }`
- `POST /api/notion/save` `{ github_url, rescue_plan }` → `{ notion_page_url }`

Legacy landing page is available at `/legacy`.

Enter any public GitHub repo URL and get a visual story with:
- AI-generated story slides
- Improvement suggestions
- Build guide
- Resources
- Roadmap
