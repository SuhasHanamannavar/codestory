import os
import httpx
import asyncio
import math
import time
from datetime import datetime, timezone

from services.github_utils import parse_github_url

MONTHS_AGO_CUTOFF = 12
CACHE_TTL = 600  # 10 minutes


_cache = {}


def _cache_key(repo_url: str):
    return f"github_ingest:{repo_url}"


def _get_cached(repo_url: str):
    key = _cache_key(repo_url)
    entry = _cache.get(key)
    if entry and (time.time() - entry["ts"]) < CACHE_TTL:
        return entry["data"]
    return None


def _set_cache(repo_url: str, data: dict):
    _cache[_cache_key(repo_url)] = {"data": data, "ts": time.time()}


def _months_since(date_str):
    if not date_str:
        return MONTHS_AGO_CUTOFF
    try:
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        return max(0, (now - dt).days / 30.44)
    except Exception:
        return MONTHS_AGO_CUTOFF


def _temporal_decay(months):
    return math.exp(-0.08 * months)


HIGh_COMPLEXITY_EXTS = {"py", "js", "ts", "tsx", "jsx", "java", "go", "rs", "cpp", "c", "cs", "rb"}
MEDIUM_COMPLEXITY_EXTS = {"json", "yaml", "yml", "xml", "sql", "sh", "bat", "ps1", "dockerfile"}


def _complexity_signal(path):
    ext = path.split(".")[-1].lower() if "." in path else ""
    if ext in HIGh_COMPLEXITY_EXTS:
        return 0.4
    if ext in MEDIUM_COMPLEXITY_EXTS:
        return 0.2
    return 0.1


def _module_from_path(path):
    return path.split('/')[0] if '/' in path else path


async def _fetch_json(client, url, headers):
    resp = await client.get(url, headers=headers)
    if resp.status_code == 200:
        return resp.json()
    return None


class GitHubIngestor:
    def __init__(self, user_token=None):
        self.token = user_token or os.getenv("GITHUB_TOKEN")
        self.headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "TurnoverGuard"}
        if self.token:
            self.headers["Authorization"] = f"token {self.token}"

    async def ingest(self, repo_url: str):
        cached = _get_cached(repo_url)
        if cached:
            return cached

        owner, repo = parse_github_url(repo_url)
        if not owner or not repo:
            raise ValueError(f"Invalid GitHub URL: {repo_url}")

        async with httpx.AsyncClient(timeout=60.0) as client:
            repo_resp = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}", headers=self.headers
            )
            if repo_resp.status_code in (403, 429):
                raise Exception("GitHub rate limit hit. Wait a few minutes and try again.")
            if repo_resp.status_code == 404:
                raise Exception("Repository not found or unauthorized (check token/scopes).")
            if repo_resp.status_code != 200:
                raise Exception(f"GitHub API error: {repo_resp.status_code} - {repo_resp.text}")

            commits_data, prs_data = await asyncio.gather(
                self._fetch_all_commits(client, owner, repo),
                self._fetch_all_prs(client, owner, repo),
            )

            commit_details, pr_data = await asyncio.gather(
                self._fetch_commit_details_batched(client, owner, repo, commits_data),
                self._fetch_pr_reviews_batched(client, owner, repo, prs_data),
            )

            nodes, edges_set = self._build_knowledge_graph(
                commit_details, pr_data
            )

            final_nodes = self._compute_risk_scores(nodes)

            modules = list(nodes.keys())
            edges = self._build_edges(modules, nodes, edges_set)

            result = {
                "nodes": final_nodes,
                "edges": edges,
                "pr_analysis": {
                    "total_prs": len(prs_data),
                    "review_coverage": len(set(
                        r.get("user", {}).get("login")
                        for _pr_number, _pr_author, reviews, _pr_files in pr_data
                        for r in reviews
                    ))
                }
            }

            _set_cache(repo_url, result)
            return result

    async def _fetch_all_commits(self, client, owner, repo):
        all_commits = []
        page = 1
        max_pages = 1
        while len(all_commits) < 30 and page <= max_pages:
            await asyncio.sleep(0.3)
            data = await _fetch_json(
                client,
                f"https://api.github.com/repos/{owner}/{repo}/commits?per_page=30&page={page}",
                self.headers
            )
            if not data:
                break
            all_commits.extend(data)
            if len(data) < 30:
                break
            page += 1
        return all_commits[:30]

    async def _fetch_all_prs(self, client, owner, repo):
        all_prs = []
        page = 1
        max_pages = 1
        while len(all_prs) < 15 and page <= max_pages:
            await asyncio.sleep(0.3)
            data = await _fetch_json(
                client,
                f"https://api.github.com/repos/{owner}/{repo}/pulls?state=all&per_page=15&page={page}",
                self.headers
            )
            if not data:
                break
            all_prs.extend(data)
            if len(data) < 15:
                break
            page += 1
        return all_prs[:15]

    async def _fetch_commit_details_batched(self, client, owner, repo, commits):
        sem = asyncio.Semaphore(3)

        async def fetch(sha):
            async with sem:
                await asyncio.sleep(0.2)
                return await _fetch_json(
                    client,
                    f"https://api.github.com/repos/{owner}/{repo}/commits/{sha}",
                    self.headers
                )

        shas = [c["sha"] for c in commits[:15] if c.get("sha")]
        results = await asyncio.gather(*[fetch(sha) for sha in shas])
        return [r for r in results if r is not None]

    async def _fetch_pr_reviews_batched(self, client, owner, repo, prs):
        sem = asyncio.Semaphore(3)

        async def fetch_pr_data(pr):
            pr_number = pr["number"]
            pr_author = pr.get("user", {}).get("login", "unknown")
            async with sem:
                await asyncio.sleep(0.2)
                reviews = await _fetch_json(
                    client,
                    f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}/reviews",
                    self.headers
                )
                pr_files = await _fetch_json(
                    client,
                    f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}/files",
                    self.headers
                )
            reviews = reviews or []
            pr_files = pr_files or []
            return pr_number, pr_author, reviews, pr_files

        tasks = [fetch_pr_data(pr) for pr in prs]
        return await asyncio.gather(*tasks)

    def _build_knowledge_graph(self, commit_details, pr_data):
        nodes = {}

        for detail in commit_details:
            author_login = "unknown"
            if detail.get("author"):
                author_login = detail["author"].get("login", "unknown")
            elif detail.get("commit", {}).get("author"):
                author_login = detail["commit"]["author"].get("name", "unknown")

            commit_date = None
            if detail.get("commit", {}).get("author", {}).get("date"):
                commit_date = detail["commit"]["author"]["date"]

            files = detail.get("files", [])

            for f in files:
                path = f.get("filename", "")
                module = _module_from_path(path)

                if module not in nodes:
                    nodes[module] = {
                        "id": module,
                        "label": module,
                        "owners_dict": {},
                        "reviewers_dict": {},
                        "commit_dates": {},
                        "complexity": 0.1,
                        "file_count": 0,
                        "longest_path": path,
                    }

                nodes[module]["complexity"] = max(
                    nodes[module]["complexity"], _complexity_signal(path)
                )
                nodes[module]["file_count"] += 1
                if len(path) > len(nodes[module]["longest_path"]):
                    nodes[module]["longest_path"] = path

                if author_login not in nodes[module]["commit_dates"]:
                    nodes[module]["commit_dates"][author_login] = []
                if commit_date:
                    nodes[module]["commit_dates"][author_login].append(commit_date)

                weight = _temporal_decay(_months_since(commit_date))
                nodes[module]["owners_dict"][author_login] = \
                    nodes[module]["owners_dict"].get(author_login, 0) + weight

        for _pr_number, pr_author, reviews, pr_files in pr_data:
            for review in reviews:
                reviewer = review.get("user", {}).get("login")
                if not reviewer or reviewer == pr_author:
                    continue
                for pf in (pr_files or [])[:5]:
                    path = pf.get("filename", "")
                    module = _module_from_path(path)
                    if module in nodes:
                        nodes[module]["reviewers_dict"][reviewer] = \
                            nodes[module]["reviewers_dict"].get(reviewer, 0) + 1

        edges_set = set()
        return nodes, edges_set

    def _compute_risk_scores(self, nodes):
        final_nodes = []
        for m, data in nodes.items():
            owners = data["owners_dict"]
            reviewers = data["reviewers_dict"]
            total_weight = sum(owners.values()) if owners else 0

            all_contributors = set(owners.keys()) | set(reviewers.keys())
            owner_list = []

            for name in all_contributors:
                commit_conc = owners.get(name, 0) / total_weight if total_weight > 0 else 0
                review_excl = reviewers.get(name, 0) / (sum(reviewers.values()) or 1) if sum(reviewers.values()) > 0 else 0

                dates = data["commit_dates"].get(name, [])
                if dates:
                    latest = max(dates)
                    recency = 1.0 - min(1.0, _months_since(latest) / MONTHS_AGO_CUTOFF)
                else:
                    recency = 0.0

                complexity = data["complexity"]

                multi_signal = (
                    commit_conc * 0.4 +
                    review_excl * 0.3 +
                    recency * 0.2 +
                    complexity * 0.1
                )

                owner_list.append({
                    "name": name,
                    "share": round(commit_conc, 4),
                    "review_share": round(review_excl, 4),
                    "recency_score": round(recency, 4),
                    "complexity_score": round(complexity, 4),
                    "effective_score": round(multi_signal, 4)
                })

            owner_list.sort(key=lambda o: o["effective_score"], reverse=True)

            max_signal = max([o["effective_score"] for o in owner_list]) if owner_list else 0
            top_share = owner_list[0].get("share", 0) if owner_list else 0
            owner_count = len(owner_list)
            spread_factor = 1.0 - (min(owner_count, 5) / 10.0)
            risk_score = max_signal * 0.7 + top_share * 0.15 + spread_factor * 0.15
            risk_score = min(1.0, risk_score)

            final_nodes.append({
                "id": m,
                "label": m,
                "risk_score": round(risk_score, 4),
                "owners": owner_list,
                "signals": {
                    "file_count": data["file_count"],
                    "complexity": round(data["complexity"], 2),
                    "total_contributors": len(all_contributors)
                }
            })

        return final_nodes

    def _build_edges(self, modules, nodes, edges_set):
        for i in range(len(modules)):
            for j in range(i + 1, len(modules)):
                if nodes[modules[i]].get("longest_path", "").split("/")[0] == \
                   nodes[modules[j]].get("longest_path", "").split("/")[0]:
                    edges_set.add((modules[i], modules[j]))

        if not edges_set:
            for i in range(len(modules) - 1):
                edges_set.add((modules[i], modules[i + 1]))

        return [{"source": s, "target": t} for s, t in edges_set]
