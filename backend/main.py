import os
import json
import base64
import re
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
    story_type: str = 'technical'

def clean_json_string(s):
    s = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', s)
    return s

async def fetch_github_data(repo_url: str) -> dict:
    patterns = [r"github\.com/([^/]+)/([^/]+)", r"github\.com/([^/]+)/([^/]+)/.*"]
    owner, repo = None, None
    for pattern in patterns:
        match = re.search(pattern, repo_url)
        if match:
            owner, repo = match.group(1), match.group(2).replace(".git", "")
            break
    
    if not owner or not repo:
        raise Exception(f"Could not parse GitHub URL: {repo_url}")
    
    token = os.getenv("GITHUB_TOKEN")
    headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "CodeStory-App"}
    if token:
        headers["Authorization"] = f"token {token}"
    
    base = f"https://api.github.com/repos/{owner}/{repo}"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        repo_resp = await client.get(base, headers=headers)
        if repo_resp.status_code == 404:
            raise Exception(f"Repository not found: {owner}/{repo}")
        elif repo_resp.status_code == 403:
            raise Exception("GitHub API rate limit exceeded. Please try again later.")
        elif repo_resp.status_code != 200:
            raise Exception(f"GitHub API error: {repo_resp.status_code}")
        repo_data = repo_resp.json()
        
        readme_resp = await client.get(f"{base}/readme", headers=headers)
        readme_content = ""
        if readme_resp.status_code == 200:
            readme_data = readme_resp.json()
            if "content" in readme_data:
                readme_content = base64.b64decode(readme_data["content"]).decode("utf-8")
        
        lang_resp = await client.get(f"{base}/languages", headers=headers)
        languages = lang_resp.json() if lang_resp.status_code == 200 else {}
        
        tree_resp = await client.get(f"{base}/git/trees/HEAD?recursive=1", headers=headers)
        files = []
        if tree_resp.status_code == 200:
            tree_data = tree_resp.json()
            files = [f["path"] for f in tree_data.get("tree", []) if f["type"] == "blob"][:30]
        
        code_exts = ['.py', '.js', '.ts', '.tsx', '.jsx', '.sol', '.dart', '.go', '.rs', '.java']
        code_files = [f for f in files if any(f.endswith(ext) for ext in code_exts)][:2]
        
        code_contents = {}
        for file_path in code_files:
            content_resp = await client.get(f"{base}/contents/{file_path}", headers=headers)
            if content_resp.status_code == 200:
                file_data = content_resp.json()
                if "content" in file_data and file_data.get("encoding") == "base64":
                    try:
                        code_contents[file_path] = base64.b64decode(file_data["content"]).decode("utf-8")[:800]
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
            "files": files,
            "code_contents": code_contents
        }

async def analyze_with_groq(github_data: dict, story_type: str = 'technical') -> dict:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise Exception("GROQ_API_KEY not configured")
    
    repo_name = github_data.get('name', '')
    repo_owner = github_data.get('owner', '')
    repo_desc = (github_data.get('description') or 'No description')[:200]
    repo_lang = github_data.get('language') or 'Unknown'
    repo_stars = github_data.get('stars', 0)
    repo_forks = github_data.get('forks', 0)
    repo_topics = ', '.join(github_data.get('topics', [])[:5]) or 'None'
    repo_readme = (github_data.get('readme') or 'No README')[:800]
    repo_files = ', '.join(github_data.get('files', [])[:15])
    repo_file_count = len(github_data.get('files', []))
    repo_code_count = len(github_data.get('code_contents', {}))
    repo_languages = '\n'.join([f"- {k}: {v}" for k, v in (github_data.get('languages') or {}).items()]) or 'Unknown'
    repo_file_types = ', '.join([f.split('.')[-1] for f in github_data.get('files', [])[:10]]) or 'Unknown'
    repo_topic_count = len(github_data.get('topics', []))
    repo_url = github_data.get('url', '')
    
    story_configs = {
        "technical": [
            {"title": repo_name, "subtitle": "Project Overview", "icon": "⚙️", "content": f"Owner: {repo_owner} | Stars: {repo_stars} | Forks: {repo_forks}\n\nDescription: {repo_desc}\n\nTopics: {repo_topics}"},
            {"title": "The Problem", "subtitle": "What It Solves", "icon": "🎯", "content": f"From README:\n{repo_readme}"},
            {"title": "Architecture", "subtitle": "How It Works", "icon": "🏗️", "content": f"File Structure:\n{repo_files}\n\nCode from {repo_code_count} source files analyzed"},
            {"title": "Tech Stack", "subtitle": "Technologies", "icon": "🛠️", "content": f"Primary: {repo_lang}\n\nLanguages:\n{repo_languages}\n\nFile types: {repo_file_types}"},
            {"title": "Key Features", "subtitle": "Highlights", "icon": "✨", "content": f"Core functionality based on code structure and analysis"},
            {"title": "Code Quality", "subtitle": "Metrics", "icon": "📊", "content": f"Stats:\n⭐ {repo_stars} stars\n🍴 {repo_forks} forks\n📁 {repo_file_count} files\n🏷️ {repo_topic_count} topics"},
            {"title": "Next Steps", "subtitle": "Improvements", "icon": "🚀", "content": "Potential enhancements based on code analysis"}
        ],
        "investor": [
            {"title": repo_name, "subtitle": "Vision & Mission", "icon": "💡", "content": f"Founder: {repo_owner}\n\nMission: {repo_desc}\n\n{repo_topics}"},
            {"title": "The Problem", "subtitle": "Market Pain", "icon": "😤", "content": f"Pain points addressed:\n{repo_readme}"},
            {"title": "The Solution", "subtitle": "How It Works", "icon": "💰", "content": f"Key files:\n{repo_files}"},
            {"title": "Built With", "subtitle": "Technology", "icon": "🏆", "content": f"Tech: {repo_lang}\n\n{repo_languages}"},
            {"title": "Traction", "subtitle": "Metrics", "icon": "📈", "content": f"⭐ {repo_stars} Stars\n🍴 {repo_forks} Forks\n👥 Active development\n🏷️ {repo_topics}"},
            {"title": "What's Next", "subtitle": "Growth", "icon": "🎯", "content": "Future roadmap and expansion plans"},
            {"title": "Get Involved", "subtitle": "Join Us", "icon": "🤝", "content": "Contribute, invest, or partner with us"}
        ],
        "developer": [
            {"title": repo_name, "subtitle": "What Is This", "icon": "👨‍💻", "content": f"Created by {repo_owner}\n\n{repo_desc}\n\nTopics: {repo_topics}"},
            {"title": "Why Built", "subtitle": "Purpose", "icon": "💭", "content": f"The story behind:\n{repo_readme}"},
            {"title": "Architecture", "subtitle": "Deep Dive", "icon": "🔍", "content": f"Key files:\n{repo_files}\n\n{repo_code_count} source files"},
            {"title": "Tech Stack", "subtitle": "Tools Used", "icon": "🛠️", "content": f"Main: {repo_lang}\n\n{repo_languages}\n\n{repo_file_types}"},
            {"title": "Key Features", "subtitle": "Highlights", "icon": "✨", "content": f"Features:\n- Core modules\n- Main functionality\n- Key configurations"},
            {"title": "How To Contribute", "subtitle": "Join", "icon": "🤝", "content": "Steps:\n1. Fork the repo\n2. Read the README\n3. Pick an issue\n4. Submit PR"},
            {"title": "Impact", "subtitle": "Community", "icon": "🌍", "content": f"⭐ {repo_stars} stars\n🍴 {repo_forks} forks"}
        ]
    }
    
    slides = story_configs.get(story_type, story_configs["technical"])
    
    prompt = f"""You are analyzing: {repo_name} ({story_type} story)

Repository Data:
- Owner: {repo_owner}
- Description: {repo_desc}
- Language: {repo_lang}
- Stars: {repo_stars}, Forks: {repo_forks}
- Topics: {repo_topics}

README:
{repo_readme}

Files:
{repo_files}

Return ONLY this JSON (no markdown, no backticks):
{{
  "story_slides": {json.dumps(slides)},
  "improvements": [
    {{"title": "Add [specific feature] in [file]", "description": "Why: [reason]", "priority": "High", "effort": "1 day"}},
    {{"title": "Add [validation] in [file]", "description": "Why: [security/reliability]", "priority": "High", "effort": "1 week"}},
    {{"title": "Add unit tests for [module]", "description": "Why: [coverage]", "priority": "Medium", "effort": "1 week"}},
    {{"title": "Add .env.example", "description": "Why: [DX]", "priority": "Medium", "effort": "1 day"}}
  ],
  "build_guide": {{
    "overview": "Setup {repo_lang} project",
    "steps": [
      {{"step": 1, "title": "Clone", "command": "git clone {repo_url}", "file": "README.md"}},
      {{"step": 2, "title": "Install", "command": "flutter pub get / pip install", "file": "pubspec.yaml or requirements.txt"}},
      {{"step": 3, "title": "Run", "command": "flutter run / python main.py", "file": "main.dart or main.py"}}
    ],
    "tech_stack": {json.dumps(list(github_data.get('languages', {}).keys()))}
  }},
  "resources": {{
    "documentation": [
      {{"title": "{repo_lang} Official Docs", "url": "https://docs.github.com", "description": "Official documentation"}},
      {{"title": "Project README", "url": "{repo_url}", "description": "Setup guide"}}
    ],
    "tutorials": [
      {{"title": "Getting Started", "url": "{repo_url}", "description": "Learn the basics"}}
    ]
  }},
  "roadmap": {{
    "milestones": [
      {{"title": "Phase 1 - Stabilize", "days": 7, "tasks": ["Error handling", "Input validation", "Logging"]}},
      {{"title": "Phase 2 - Test", "days": 14, "tasks": ["Unit tests", "CI/CD", "Docs"]}},
      {{"title": "Phase 3 - Scale", "days": 30, "tasks": ["Performance", "Monitoring", "Scale"]}}
    ]
  }}
}}"""

    from groq import Groq
    client = Groq(api_key=api_key)
    
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a code analyst. Analyze the repository and return ONLY valid JSON with no extra text. Structure: {\"story_slides\": [{\"title\": \"...\", \"subtitle\": \"...\", \"icon\": \"...\", \"content\": \"...\"}], \"improvements\": [{\"title\": \"...\", \"description\": \"...\", \"priority\": \"...\", \"effort\": \"...\"}], \"build_guide\": {\"overview\": \"...\", \"steps\": [{\"step\": 1, \"title\": \"...\", \"command\": \"...\", \"file\": \"...\"}], \"tech_stack\": []}, \"resources\": {\"documentation\": [], \"tutorials\": []}, \"roadmap\": {\"milestones\": []}}. Return valid JSON only - no explanations, no extra text before or after."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=3000
        )
        
        content = response.choices[0].message.content
        content = content.strip()
        
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            parts = content.split("```")
            if len(parts) >= 2:
                content = parts[1]
        
        content = clean_json_string(content)
        
        if not content.strip():
            raise Exception("Empty response from Groq")
        
        result = json.loads(content)
        return result
    except json.JSONDecodeError as e:
        raise Exception(f"Invalid JSON: {e.msg}")
    except Exception as e:
        raise Exception(f"Groq API error: {e}")

@app.post("/api/analyze")
async def analyze(request: AnalyzeRequest):
    try:
        print(f"\n📡 Analyzing: {request.github_url}")
        
        github_data = await fetch_github_data(request.github_url)
        
        print(f"   ✅ Found: {github_data['name']}")
        print(f"   📊 Stars: {github_data['stars']} | Forks: {github_data['forks']}")
        print(f"   🗣️ Language: {github_data['language']}")
        print(f"   📁 Files: {len(github_data['files'])}")
        
        print("   🤖 Analyzing with Groq...")
        analysis = await analyze_with_groq(github_data, request.story_type)
        
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
                "languages": github_data.get("languages", {})
            },
            "analysis": analysis
        }
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON parse error: {e}")
        raise HTTPException(status_code=500, detail="AI returned invalid JSON")
    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
def health():
    return {"status": "healthy", "services": {"github": "ok", "groq": "ok"}}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)