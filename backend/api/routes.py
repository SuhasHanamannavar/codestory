import os
import json
import uuid
import httpx
from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.responses import RedirectResponse
from services.github_ingestor import GitHubIngestor
from pydantic import BaseModel
from typing import Optional

from github_engine import GitHubEngine
from claude_engine import ClaudeEngine
from turnover_agents import ImpactMapper, TransferScheduler, PlaybookWriter

router = APIRouter()

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

gh_engine = GitHubEngine()
claude = ClaudeEngine()
impact_mapper = ImpactMapper()
transfer_scheduler = TransferScheduler()
playbook_writer = PlaybookWriter()


class AnalyzeRequest(BaseModel):
    github_url: str


class IngestRequest(BaseModel):
    github_url: str


class SimulateRequest(BaseModel):
    github_url: str
    developer: str


class CodeExchangeRequest(BaseModel):
    code: str


class NotionSaveRequest(BaseModel):
    github_url: str
    rescue_plan: dict


def get_token(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        return authorization.split(" ")[1]
    return None


@router.get("/auth/github/start")
async def github_auth_start():
    if not GITHUB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GITHUB_CLIENT_ID not configured")
    redirect_uri = f"{FRONTEND_URL}/auth/callback"
    url = f"https://github.com/login/oauth/authorize?client_id={GITHUB_CLIENT_ID}&redirect_uri={redirect_uri}&scope=read:user,public_repo"
    return RedirectResponse(url)


async def _exchange_github_code(code: str):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code
            }
        )
        data = resp.json()
        token = data.get("access_token")
        if not token:
            raise HTTPException(status_code=400, detail="Failed to get token")
        return token


@router.get("/auth/github/callback")
async def github_auth_callback(code: str):
    token = await _exchange_github_code(code)
    return RedirectResponse(f"{FRONTEND_URL}#token={token}")


@router.post("/api/auth/exchange")
async def github_auth_exchange(req: CodeExchangeRequest):
    token = await _exchange_github_code(req.code)
    return {"token": token}


@router.post("/api/analyze")
async def analyze_repo(req: AnalyzeRequest):
    repo_data = await gh_engine.get_repository_async(req.github_url)
    if not repo_data:
        raise HTTPException(status_code=404, detail="Repository not found or is private")

    analysis = claude.generate_story(repo_data)

    repo_meta = {
        "name": repo_data.get("name", "Unknown"),
        "stars": repo_data.get("stars", 0),
        "forks": repo_data.get("forks", 0),
        "file_count": len(repo_data.get("files", []) or []),
        "language": repo_data.get("language", "Unknown"),
    }

    return {
        "success": True,
        "repo_meta": repo_meta,
        "analysis": analysis
    }


@router.post("/api/ingest")
async def ingest_repo(req: IngestRequest, token: str = Depends(get_token)):
    try:
        ingestor = GitHubIngestor(user_token=token)
        graph = await ingestor.ingest(req.github_url)
        return _graph_snapshot_to_compat(graph)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/simulate_resignation")
async def simulate_resignation(req: SimulateRequest):
    ingestor = GitHubIngestor()
    try:
        graph = await ingestor.ingest(req.github_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch graph: {e}")

    nodes = graph.get("nodes", [])
    edges = graph.get("edges", [])

    before_nodes = _deep_copy_nodes(nodes)

    after_nodes = []
    deltas = []

    for node in before_nodes:
        owners = node.get("owners", [])
        filtered = [o for o in owners if o.get("name", "").lower() != req.developer.lower()]
        total_share = sum(o.get("share", 0) for o in owners)
        removed_share = sum(o.get("share", 0) for o in owners if o.get("name", "").lower() == req.developer.lower())

        if filtered and total_share > 0:
            scale = total_share / (total_share - removed_share) if (total_share - removed_share) > 0 else 1
            redistributed = []
            for o in filtered:
                redistributed.append({
                    "name": o["name"],
                    "share": o.get("share", 0) * scale,
                    "effective_score": o.get("share", 0) * scale
                })
        else:
            redistributed = filtered if filtered else [{"name": "unassigned", "share": 1.0, "effective_score": 1.0}]

        old_max = max([o.get("share", 0) for o in owners]) if owners else 0
        new_max = max([o.get("share", 0) for o in redistributed]) if redistributed else 1.0
        new_owner_count = len(redistributed)
        new_spread = 1.0 - (min(new_owner_count, 5) / 10.0)
        old_risk = 0.1 + (old_max * 0.6)
        new_risk = min(1.0, new_max * 0.85 + new_spread * 0.15)

        deltas.append({
            "node_id": node["id"],
            "risk_before": round(old_risk, 4),
            "risk_after": round(new_risk, 4)
        })

        after_nodes.append({
            "id": node["id"],
            "label": node.get("label", node["id"]),
            "risk_score": round(new_risk, 4),
            "owners": redistributed
        })

    return {
        "before": {"nodes": before_nodes, "edges": edges},
        "after": {"nodes": after_nodes, "edges": edges},
        "deltas": deltas
    }


@router.post("/api/rescue_plan")
async def rescue_plan(req: SimulateRequest):
    ingestor = GitHubIngestor()
    try:
        graph = await ingestor.ingest(req.github_url)
    except Exception:
        graph = {"nodes": [], "edges": []}

    nodes = graph.get("nodes", [])
    developer = req.developer

    impact_map = {}
    transfer_schedule = []
    total_tasks = 0

    for node in nodes:
        dev_share = 0
        other_owners = []
        for o in node.get("owners", []):
            if o.get("name", "").lower() == developer.lower():
                dev_share = o.get("share", 0)
            else:
                other_owners.append(o["name"])

        if dev_share > 0:
            impact_map[node["id"]] = {
                "module": node.get("label", node["id"]),
                "current_risk": node.get("risk_score", 0.3),
                "dev_share": dev_share,
                "successors": other_owners
            }

            tasks_for_module = max(1, round(dev_share * 5))
            total_tasks += tasks_for_module
            transfer_schedule.append({
                "module": node.get("label", node["id"]),
                "from": developer,
                "to": other_owners if other_owners else ["needs_assignment"],
                "knowledge_transfer_days": max(1, round(dev_share * 14)),
                "criticality": "high" if dev_share > 0.5 else "medium" if dev_share > 0.2 else "low"
            })

    try:
        repo_data = await gh_engine.get_repository_async(req.github_url)
        repo_name = repo_data.get("name", "repository") if repo_data else "repository"
    except Exception:
        repo_name = "repository"

    technical_playbook = f"""Knowledge Transfer Plan for {developer} — {repo_name}

1. IMMEDIATE (Days 1-3):
   - Schedule handover meetings with all affected module owners
   - Document current work-in-progress items and commits
   - Tag relevant branches and create handover documentation

2. SHORT TERM (Days 4-10):
   - {', '.join([f'Transfer ownership of {m["module"]}' for m in transfer_schedule[:3]]) if transfer_schedule else 'Review all module ownership assignments'}
   - Update CI/CD pipeline configuration and secrets
   - Create runbooks for critical operations

3. MEDIUM TERM (Days 11-20):
   - Complete code review of outstanding PRs by {developer}
   - Set up monitoring alerts for newly unowned modules
   - Document architecture decisions and rationale

4. LONG TERM (Days 21-30):
   - Verify all deployments are stable post-transition
   - Schedule follow-up training for new module owners
   - Conduct retrospective and update bus factor documentation"""

    client_playbook = f"""Stakeholder Communication Plan — {developer} Resignation

1. INTERNAL COMMUNICATION (Day 1):
   - Notify engineering team about the transition
   - Identify backup owners for each affected module
   - Set up new code review assignments

2. PROJECT STAKEHOLDERS (Days 2-3):
   - Assess impact on upcoming milestones and deliverables
   - Adjust sprint commitments if necessary
   - Communicate timeline adjustments to product owners

3. KNOWLEDGE PRESERVATION (Days 4-14):
   - Record architecture walkthrough sessions
   - Document tribal knowledge and common pitfalls
   - Update onboarding documentation

4. RISK MITIGATION (Days 15-30):
   - Monitor module health metrics daily
   - Implement additional testing for high-risk areas
   - Schedule pair programming sessions for complex modules"""

    return {
        "impact_map": impact_map,
        "transfer_schedule_30d": transfer_schedule,
        "playbooks": {
            "technical": technical_playbook,
            "client": client_playbook
        }
    }


@router.post("/api/notion/save")
async def notion_save(req: NotionSaveRequest):
    api_key = os.getenv("NOTION_API_KEY")
    database_id = os.getenv("NOTION_DATABASE_ID")

    if not api_key:
        return {
            "status": "mock_saved",
            "notion_page_url": "https://notion.so/codestory-rescue-plan-mock",
            "message": "Notion API not configured. Set NOTION_API_KEY in .env for real integration."
        }

    try:
        title = f"Rescue Plan — {req.github_url.split('/')[-1] or 'Repository'}"
        rescue = req.rescue_plan

        payload = {
            "parent": {"database_id": database_id} if database_id else {"type": "page_id"},
            "properties": {
                "title": {"title": [{"text": {"content": title}}]}
            },
            "children": [
                {
                    "object": "block",
                    "type": "heading_2",
                    "heading_2": {
                        "rich_text": [{"type": "text", "text": {"content": "Rescue Plan Overview"}}]
                    }
                },
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"type": "text", "text": {"content": json.dumps(rescue.get("impact_map", {}), indent=2)[:2000]}}]
                    }
                }
            ]
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.notion.com/v1/pages",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "Notion-Version": "2022-06-28"
                },
                json=payload,
                timeout=15
            )
            if resp.status_code == 200:
                data = resp.json()
                page_url = data.get("url", f"https://notion.so/{data.get('id', 'unknown')}")
                return {"status": "saved", "notion_page_url": page_url}
            else:
                return {
                    "status": "api_error",
                    "detail": resp.text[:500],
                    "notion_page_url": f"https://notion.so/codestory-rescue-plan-{uuid.uuid4().hex[:8]}"
                }
    except Exception as e:
        return {
            "status": "error",
            "detail": str(e),
            "notion_page_url": f"https://notion.so/codestory-rescue-plan-{uuid.uuid4().hex[:8]}"
        }


@router.post("/api/turnover/analyze")
async def turnover_analyze(req: AnalyzeRequest):
    ingestor = GitHubIngestor()
    try:
        graph = await ingestor.ingest(req.github_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze: {e}")

    nodes = graph.get("nodes", [])
    edges = graph.get("edges", [])
    pr_analysis = graph.get("pr_analysis", {})

    total_risk = 0
    for n in nodes:
        total_risk += n.get("risk_score", 0)
    avg_risk = round(total_risk / len(nodes), 4) if nodes else 0

    high_risk_count = sum(1 for n in nodes if n.get("risk_score", 0) > 0.5)
    single_owner_count = sum(
        1 for n in nodes
        if len(n.get("owners", [])) == 1 and n["owners"][0].get("effective_score", 0) > 0.5
    )

    return {
        "nodes": nodes,
        "edges": edges,
        "pr_analysis": pr_analysis,
        "metrics": {
            "total_modules": len(nodes),
            "avg_risk": avg_risk,
            "high_risk_modules": high_risk_count,
            "single_owner_modules": single_owner_count,
            "temporal_decay_active": True,
            "multi_signal_enabled": True
        }
    }


@router.post("/api/turnover/simulate")
async def turnover_simulate(req: SimulateRequest):
    ingestor = GitHubIngestor()
    try:
        graph = await ingestor.ingest(req.github_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch graph: {e}")

    nodes = graph.get("nodes", [])
    edges = graph.get("edges", [])
    developer = req.developer

    before_nodes = _deep_copy_nodes(nodes)
    after_nodes = []
    deltas = []
    cascade_risk = []

    module_map = {n["id"]: n for n in before_nodes}

    for node in before_nodes:
        owners = node.get("owners", [])
        filtered = [o for o in owners if o["name"].lower() != developer.lower()]
        removed = [o for o in owners if o["name"].lower() == developer.lower()]
        removed_share = sum(o.get("effective_score", o.get("share", 0)) for o in removed)
        total_before = sum(o.get("effective_score", o.get("share", 0)) for o in owners)

        if filtered and total_before > 0:
            scale = total_before / (total_before - removed_share) if (total_before - removed_share) > 0 else 1
            redistributed = []
            for o in filtered:
                redistributed.append({
                    "name": o["name"],
                    "share": round(o.get("share", 0) * scale, 4),
                    "effective_score": round(o.get("effective_score", 0) * scale, 4)
                })
        else:
            redistributed = filtered if filtered else [{"name": "unassigned", "share": 1.0, "effective_score": 0.5}]

        old_max = max([o.get("effective_score", o.get("share", 0)) for o in owners]) if owners else 0
        new_max = max([o.get("effective_score", o.get("share", 0)) for o in redistributed]) if redistributed else 1.0
        old_risk = node.get("risk_score", 0.3)
        top_share_after = redistributed[0].get("share", 0) if redistributed else 0
        owner_count_after = len(redistributed)
        spread_after = 1.0 - (min(owner_count_after, 5) / 10.0)
        new_risk = min(1.0, new_max * 0.7 + top_share_after * 0.15 + spread_after * 0.15)

        deltas.append({
            "node_id": node["id"],
            "risk_before": round(old_risk, 4),
            "risk_after": round(new_risk, 4)
        })

        after_nodes.append({
            "id": node["id"],
            "label": node.get("label", node["id"]),
            "risk_score": round(new_risk, 4),
            "owners": redistributed
        })

    for edge in edges:
        source = edge.get("source")
        target = edge.get("target")
        source_node = module_map.get(source)
        target_node = module_map.get(target)
        if source_node and target_node:
            src_after = next((n for n in after_nodes if n["id"] == source), None)
            if src_after and src_after["risk_score"] > 0.6:
                tgt_new_risk = target_node.get("risk_score", 0.3) * 1.4
                cascade_risk.append({
                    "source_module": source,
                    "affected_module": target,
                    "propagation_risk": round(min(tgt_new_risk, 1.0), 4)
                })

    return {
        "before": {"nodes": before_nodes, "edges": edges},
        "after": {"nodes": after_nodes, "edges": edges},
        "deltas": deltas,
        "cascade_risk": cascade_risk
    }


@router.post("/api/turnover/rescue")
async def turnover_rescue(req: SimulateRequest):
    ingestor = GitHubIngestor()
    repo_name = "repository"

    try:
        repo_data = await gh_engine.get_repository_async(req.github_url)
        repo_name = repo_data.get("name", "repository") if repo_data else "repository"
    except Exception:
        pass

    try:
        graph = await ingestor.ingest(req.github_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch graph: {e}")

    impact_result = impact_mapper.analyze(repo_name, req.developer, graph)
    schedule_result = transfer_scheduler.generate(repo_name, req.developer, impact_result)
    playbooks = playbook_writer.generate(repo_name, req.developer, impact_result, schedule_result)

    return {
        "impact_map": impact_result,
        "transfer_schedule_30d": schedule_result.get("schedule", []),
        "schedule_meta": {
            "total_hours": schedule_result.get("total_hours_required", 0),
            "parallel_tracks": schedule_result.get("parallel_tracks", []),
            "compression_feasible": schedule_result.get("compression_feasible", True)
        },
        "playbooks": {
            "technical": playbooks.get("technical_playbook", ""),
            "client": playbooks.get("client_playbook", "")
        }
    }


@router.post("/api/turnover/notion")
async def turnover_notion_save(req: NotionSaveRequest):
    api_key = os.getenv("NOTION_API_KEY")
    database_id = os.getenv("NOTION_DATABASE_ID")

    rescue = req.rescue_plan
    impact = rescue.get("impact_map", {})
    schedule = rescue.get("transfer_schedule_30d", [])
    playbooks = rescue.get("playbooks", {})

    title = f"TurnoverGuard Rescue — {req.github_url.split('/')[-1] or 'Repository'}"

    notion_content = {
        "status": "generated",
        "title": title,
        "sections": {
            "overview": f"Rescue plan for {req.github_url}",
            "impact": json.dumps(impact, indent=2)[:2000],
            "schedule": json.dumps(schedule[:10], indent=2)[:2000],
            "technical_playbook": (playbooks.get("technical", "") or "")[:3000],
            "client_playbook": (playbooks.get("client", "") or "")[:3000]
        }
    }

    if not api_key:
        notion_content["status"] = "mock_saved"
        notion_content["notion_page_url"] = f"https://notion.so/turnoverguard-{uuid.uuid4().hex[:8]}"
        notion_content["message"] = "Set NOTION_API_KEY in .env for real integration."
        return notion_content

    try:
        payload = {
            "parent": {"database_id": database_id} if database_id else {"type": "page_id"},
            "properties": {
                "title": {"title": [{"text": {"content": title}}]}
            },
            "children": [
                {"object": "block", "type": "heading_1",
                 "heading_1": {"rich_text": [{"text": {"content": "TurnoverGuard Rescue Plan"}}]}},
                {"object": "block", "type": "paragraph",
                 "paragraph": {"rich_text": [{"text": {"content": f"Repository: {req.github_url}"}}]}},
                {"object": "block", "type": "heading_2",
                 "heading_2": {"rich_text": [{"text": {"content": "Impact Assessment"}}]}},
                {"object": "block", "type": "paragraph",
                 "paragraph": {"rich_text": [{"text": {"content": json.dumps(impact.get("overall_impact_summary", ""), indent=2)[:2000]}}]}},
                {"object": "block", "type": "heading_2",
                 "heading_2": {"rich_text": [{"text": {"content": "Transfer Schedule"}}]}},
                {"object": "block", "type": "paragraph",
                 "paragraph": {"rich_text": [{"text": {"content": f"{len(schedule)} days planned"}}]}},
                {"object": "block", "type": "heading_2",
                 "heading_2": {"rich_text": [{"text": {"content": "Technical Playbook"}}]}},
                {"object": "block", "type": "paragraph",
                 "paragraph": {"rich_text": [{"text": {"content": (playbooks.get("technical", "") or "")[:2000]}}]}},
                {"object": "block", "type": "heading_2",
                 "heading_2": {"rich_text": [{"text": {"content": "Client Playbook"}}]}},
                {"object": "block", "type": "paragraph",
                 "paragraph": {"rich_text": [{"text": {"content": (playbooks.get("client", "") or "")[:2000]}}]}},
            ]
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.notion.com/v1/pages",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "Notion-Version": "2022-06-28"
                },
                json=payload,
                timeout=15
            )
            if resp.status_code == 200:
                data = resp.json()
                page_url = data.get("url", f"https://notion.so/{data.get('id', 'unknown')}")
                notion_content["status"] = "saved"
                notion_content["notion_page_url"] = page_url
            else:
                notion_content["status"] = "api_error"
                notion_content["detail"] = resp.text[:500]
                notion_content["notion_page_url"] = f"https://notion.so/turnoverguard-{uuid.uuid4().hex[:8]}"
    except Exception as e:
        notion_content["status"] = "error"
        notion_content["detail"] = str(e)
        notion_content["notion_page_url"] = f"https://notion.so/turnoverguard-{uuid.uuid4().hex[:8]}"

    return notion_content


def _deep_copy_nodes(nodes):
    return [
        {
            "id": n.get("id", ""),
            "label": n.get("label", n.get("id", "")),
            "risk_score": n.get("risk_score", 0.3),
            "owners": [
                {"name": o.get("name", ""), "share": o.get("share", 0), "effective_score": o.get("effective_score", 0)}
                for o in (n.get("owners", []) or [])
            ]
        }
        for n in nodes
    ]


def _graph_snapshot_to_compat(graph):
    return {
        "nodes": graph.get("nodes", []),
        "edges": graph.get("edges", [])
    }
