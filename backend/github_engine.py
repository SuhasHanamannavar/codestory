import os
import httpx
import base64

from services.github_utils import parse_github_url

class GitHubEngine:
    def __init__(self, user_token=None):
        self.base_url = "https://api.github.com"
        self.token = user_token or os.getenv("GITHUB_TOKEN")
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "CodeStory-App"
        }
        if self.token:
            self.headers["Authorization"] = f"token {self.token}"

    async def get_repository_async(self, repo_url):
        owner, repo = parse_github_url(repo_url)
        if not owner or not repo:
            return None

        base = f"{self.base_url}/repos/{owner}/{repo}"
        
        async with httpx.AsyncClient() as client:
            repo_resp = await client.get(base, headers=self.headers)
            if repo_resp.status_code != 200:
                return None
            repo_data = repo_resp.json()
            
            readme_resp = await client.get(f"{base}/readme", headers=self.headers)
            readme_content = ""
            if readme_resp.status_code == 200:
                readme_data = readme_resp.json()
                if "content" in readme_data:
                    readme_content = base64.b64decode(readme_data["content"]).decode("utf-8")
            
            tree_resp = await client.get(
                f"{base}/git/trees/HEAD?recursive=1",
                headers=self.headers)
            files = []
            if tree_resp.status_code == 200:
                tree_data = tree_resp.json()
                files = [f["path"] for f in tree_data.get("tree", []) if f["type"] == "blob"][:30]
            
            return {
                "name": repo_data.get("name"),
                "full_name": repo_data.get("full_name"),
                "description": repo_data.get("description"),
                "language": repo_data.get("language"),
                "stars": repo_data.get("stargazers_count", 0),
                "forks": repo_data.get("forks_count", 0),
                "owner": repo_data.get("owner", {}).get("login"),
                "topics": repo_data.get("topics", []),
                "readme": readme_content[:5000],
                "files": files,
                "url": repo_data.get("html_url")
            }

    def get_repository(self, repo_url):
        import asyncio
        return asyncio.run(self.get_repository_async(repo_url))