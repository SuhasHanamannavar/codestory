import os
import json
import base64
import re
import time
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    github_url: str

def clean_json_string(s):
    return re.sub(r'[\x00-\x1f\x7f-\x9f]', '', s)

def build_headers():
    headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "CodeStory-App"}
    if token := os.getenv("GITHUB_TOKEN"):
        headers["Authorization"] = f"token {token}"
    return headers

async def retry_request(client, url, headers, max_retries=3, base_delay=2):
    for attempt in range(max_retries):
        try:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 403:
                remaining = resp.headers.get("X-RateLimit-Remaining", "0")
                reset_time = resp.headers.get("X-RateLimit-Reset", "")
                if remaining == "0":
                    wait_time = int(reset_time) - int(time.time()) + 5 if reset_time.isdigit() else 60
                    print(f"   ⚠️ Rate limited. Waiting {wait_time}s...")
                    await asyncio.sleep(min(wait_time, 60))
                    continue
            return resp
        except (httpx.TimeoutException, httpx.ConnectError) as e:
            if attempt < max_retries - 1:
                delay = base_delay * (2 ** attempt)
                print(f"   ⚠️ Request failed, retrying in {delay}s...")
                await asyncio.sleep(delay)
            else:
                raise
    return None

async def fetch_github_data(repo_url: str) -> dict:
    match = re.search(r"github\.com/([^/]+)/([^/]+)", repo_url)
    if not match:
        raise Exception(f"Invalid GitHub URL: {repo_url}")
    
    owner, repo = match.group(1), match.group(2).replace(".git", "")
    headers = build_headers()
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        repo_resp = await retry_request(client, f"https://api.github.com/repos/{owner}/{repo}", headers)
        if not repo_resp:
            raise Exception("Failed to fetch repository after retries")
        if repo_resp.status_code == 404:
            raise Exception(f"Repository not found: {owner}/{repo}")
        if repo_resp.status_code == 403:
            raise Exception("GitHub API rate limit exceeded. Please add GITHUB_TOKEN to .env file.")
        if repo_resp.status_code != 200:
            raise Exception(f"GitHub API error: {repo_resp.status_code}")
        
        repo_data = repo_resp.json()
        
        readme_resp = await retry_request(client, f"https://api.github.com/repos/{owner}/{repo}/readme", headers)
        readme_content = ""
        if readme_resp and readme_resp.status_code == 200:
            data = readme_resp.json()
            if "content" in data:
                readme_content = base64.b64decode(data["content"]).decode("utf-8")
        
        lang_resp = await retry_request(client, f"https://api.github.com/repos/{owner}/{repo}/languages", headers)
        languages = lang_resp.json() if lang_resp and lang_resp.status_code == 200 else {}
        
        files = await fetch_tree_with_pagination(client, owner, repo, headers)
        
        code_exts = ['.py', '.js', '.ts', '.tsx', '.jsx', '.sol', '.dart', '.go', '.rs', '.java', '.cpp', '.c', '.rb', '.php']
        code_files = [f for f in files if any(f.endswith(ext) for ext in code_exts)][:10]
        
        code_contents = {}
        for file_path in code_files[:5]:
            content_resp = await retry_request(client, f"https://api.github.com/repos/{owner}/{repo}/contents/{file_path}", headers)
            if content_resp and content_resp.status_code == 200:
                file_data = content_resp.json()
                if "content" in file_data and file_data.get("encoding") == "base64":
                    try:
                        code_contents[file_path] = base64.b64decode(file_data["content"]).decode("utf-8")[:1500]
                    except:
                        pass
        
        return {
            "name": repo_data.get("name"),
            "full_name": repo_data.get("full_name"),
            "description": repo_data.get("description", ""),
            "language": repo_data.get("language"),
            "stars": repo_data.get("stargazers_count", 0),
            "forks": repo_data.get("forks_count", 0),
            "topics": repo_data.get("topics", []),
            "owner": repo_data.get("owner", {}).get("login"),
            "url": repo_data.get("html_url"),
            "readme": readme_content,
            "languages": languages,
            "files": files[:100],
            "code_contents": code_contents
        }

async def fetch_tree_with_pagination(client, owner, repo, headers):
    all_files = []
    sha = "HEAD"
    page_size = 100
    
    while True:
        url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{sha}?recursive=1&per_page={page_size}"
        resp = await retry_request(client, url, headers, max_retries=3)
        if not resp or resp.status_code != 200:
            break
        
        data = resp.json()
        tree = data.get("tree", [])
        all_files.extend([f["path"] for f in tree if f["type"] == "blob"])
        
        if data.get("truncated"):
            if len(tree) > 0:
                last_sha = tree[-1].get("sha")
                if last_sha:
                    sha = f"{data['sha']}:{last_sha}"
                    continue
        break
    
    if not all_files and sha != "HEAD":
        top_files_resp = await retry_request(client, f"https://api.github.com/repos/{owner}/{repo}/contents", headers)
        if top_files_resp and top_files_resp.status_code == 200:
            all_files = [f["name"] for f in top_files_resp.json() if f["type"] == "file"]
    
    return all_files

async def analyze_with_groq(github_data: dict) -> dict:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise Exception("GROQ_API_KEY not configured")
    
    name = github_data.get('name', '')
    owner = github_data.get('owner', '')
    desc = github_data.get('description') or ''
    lang = github_data.get('language') or 'Unknown'
    stars = github_data.get('stars', 0)
    forks = github_data.get('forks', 0)
    topics = ', '.join(github_data.get('topics', [])[:5]) or 'None'
    readme = github_data.get('readme') or ''
    file_list = ', '.join(github_data.get('files', [])[:30])
    file_count = len(github_data.get('files', []))
    langs = '\n'.join([f"- {k}: {v} bytes" for k, v in (github_data.get('languages') or {}).items()]) or 'Unknown'
    code_contents = github_data.get('code_contents', {})
    code_snippets = '\n\n'.join([f"=== {k} ===\n{v}" for k, v in code_contents.items()]) or 'No code available'
    
    has_readme = bool(readme and len(readme.strip()) > 50)
    
    prompt = f"""You are analyzing a GitHub repository: {name} by {owner}

REPOSITORY INFO:
- Stars: {stars} | Forks: {forks}
- Primary Language: {lang}
- Topics: {topics}
- Description: {desc or 'No description provided'}
- Total Files: {file_count}

README CONTENT:
{readme if has_readme else '[NO README FOUND - Analyze code instead]'}

CODE FILES ANALYZED:
{code_snippets}

FILE STRUCTURE:
{file_list}

Based on the REAL data above, generate a JSON with:
1. story_slides: 7 slides showing WHAT this project does in simple terms anyone can understand (not technical jargon)
2. improvements: 3-5 AI-suggested improvements
3. build_guide: Setup instructions
4. resources: Useful links
5. roadmap: Development phases

IMPORTANT: If there's no README, derive understanding from the CODE itself. Look at file names, function names, class names, and code structure to figure out what the project does.

Return ONLY valid JSON (no markdown, no code blocks):
{{
  "story_slides": [
    {{"title": "{name}", "subtitle": "What This Project Does", "icon": "🎯", "content": "[2-3 sentences explaining in SIMPLE terms what this project does, like explaining to a non-technical person]"}},
    {{"title": "The Inspiration", "subtitle": "Why It Exists", "icon": "💡", "content": "[What problem does this solve? Why was it created? Use simple language]"}},
    {{"title": "Key Features", "subtitle": "What You Can Do", "icon": "✨", "content": "[List the main capabilities/features - what can users actually DO with this?]"}},
    {{"title": "Tech Stack", "subtitle": "Built With", "icon": "🛠️", "content": "[Main technologies used: {lang}\nLanguages: {langs}]"}},
    {{"title": "Project Stats", "subtitle": "By The Numbers", "icon": "📊", "content": "⭐ {stars} stars\n🍴 {forks} forks\n📁 {file_count} files\n🏷️ Topics: {topics}"}},
    {{"title": "Get Started", "subtitle": "How To Use", "icon": "🚀", "content": "[Simple steps to get started - no jargon, just practical advice]"}},
    {{"title": "Join The Project", "subtitle": "Contribute", "icon": "🤝", "content": "[How can others help? What skills are needed?]"}}
  ],
  "improvements": [
    {{"title": "[Specific improvement]", "description": "[Why this helps]", "priority": "High|Medium|Low", "effort": "[time estimate]"}},
    ...
  ],
  "build_guide": {{
    "overview": "[One sentence about setup]",
    "steps": [
      {{"step": 1, "title": "Clone", "command": "git clone [url]", "file": "README.md"}},
      ...
    ],
    "tech_stack": []
  }},
  "resources": {{
    "documentation": [...],
    "tutorials": [...]
  }},
  "roadmap": {{
    "milestones": [...]
  }}
}}"""

    from groq import Groq
    client = Groq(api_key=api_key)
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a friendly code explainer. Explain projects in SIMPLE terms anyone can understand - no jargon. If no README exists, analyze the code to figure out what the project does."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=4000
        )
        
        content = response.choices[0].message.content.strip()
        content = clean_json_string(content)
        
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            parts = content.split("```")
            if len(parts) >= 2:
                content = parts[1]
        
        if not content.strip():
            raise Exception("Empty response from Groq")
        
        return json.loads(content)
    except json.JSONDecodeError as e:
        raise Exception(f"Invalid JSON from AI: {e}")
    except Exception as e:
        raise Exception(f"Groq API error: {e}")

@app.post("/api/analyze")
async def analyze(request: AnalyzeRequest):
    try:
        print(f"\n📡 Analyzing: {request.github_url}")
        
        github_data = await fetch_github_data(request.github_url)
        
        has_readme = bool(github_data.get('readme', '').strip())
        print(f"   ✅ Found: {github_data['name']}")
        print(f"   📖 README: {'Found' if has_readme else 'Not found - analyzing code'}")
        print(f"   📊 Stars: {github_data['stars']} | Forks: {github_data['forks']}")
        print(f"   🗣️ Language: {github_data['language']}")
        print(f"   📁 Files: {len(github_data['files'])} | Code files: {len(github_data['code_contents'])}")
        
        print("   🤖 Analyzing with Groq...")
        analysis = await analyze_with_groq(github_data)
        
        return {
            "success": True,
            "repo_meta": {
                "name": github_data["name"],
                "owner": github_data["owner"],
                "description": github_data["description"],
                "language": github_data["language"],
                "stars": github_data["stars"],
                "forks": github_data["forks"],
                "topics": github_data["topics"],
                "url": github_data["url"],
                "file_count": len(github_data["files"]),
                "languages": github_data.get("languages", {}),
                "has_readme": has_readme
            },
            "analysis": analysis
        }
        
    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)