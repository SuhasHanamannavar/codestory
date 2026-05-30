import os
import json
import re

ANALYSIS_PROMPT = """You are a senior technical storyteller. Analyze this GitHub repository data and produce a JSON analysis.

Repository Data:
- Name: {name}
- Description: {description}
- Language: {language}
- Stars: {stars}
- Forks: {forks}
- Topics: {topics}
- Owner: {owner}
- File count: {file_count}
- File structure (top 30): {files}
- README excerpt: {readme}

Return ONLY valid JSON with this exact structure:
{{
  "story_slides": [
    {{"title": "...", "subtitle": "...", "content": "Description of what this project does and why it matters", "icon": "📖"}},
    {{"title": "...", "subtitle": "...", "content": "Technical architecture overview", "icon": "🏗️"}},
    {{"title": "...", "subtitle": "...", "content": "Key features and capabilities", "icon": "⚡"}},
    {{"title": "...", "subtitle": "...", "content": "Tech stack and tools used", "icon": "🛠️"}},
    {{"title": "...", "subtitle": "...", "content": "Project structure highlights", "icon": "📁"}},
    {{"title": "...", "subtitle": "...", "content": "Community and contribution insights", "icon": "👥"}},
    {{"title": "...", "subtitle": "...", "content": "Getting started and next steps", "icon": "🚀"}}
  ],
  "improvements": [
    {{"title": "Improvement suggestion 1", "description": "Why and how", "priority": "High", "effort": "2-3 days"}}
  ],
  "build_guide": {{
    "overview": "Brief setup overview",
    "steps": [
      {{"step": 1, "title": "Step name", "command": "command here", "file": "filename if applicable"}}
    ],
    "tech_stack": ["Tech1", "Tech2"]
  }},
  "resources": {{
    "documentation": [
      {{"title": "Resource name", "url": "https://...", "description": "What this covers"}}
    ],
    "tutorials": [
      {{"title": "Tutorial name", "url": "https://...", "description": "What this teaches"}}
    ]
  }},
  "roadmap": {{
    "milestones": [
      {{"title": "Milestone", "days": 7, "tasks": ["Task 1", "Task 2"]}}
    ]
  }}
}}

Rules:
- Generate exactly 7 story slides with varied icons (📖 🏗️ ⚡ 🛠️ 📁 👥 🚀 🎯 🔧 💡)
- Include 3-6 improvements with varying priorities
- Build guide: 3-6 steps
- Resources: 2-4 documentation and 2-4 tutorials (use real, well-known URLs)
- Roadmap: 3-5 milestones with realistic duration
- Make all content specific to THIS repository, not generic"""


class ClaudeEngine:
    def __init__(self):
        self.client = None
        api_key = os.getenv("GROQ_API_KEY", "")
        if api_key:
            from groq import Groq
            self.client = Groq(api_key=api_key)

    def generate_story(self, repo_data):
        if not self.client:
            return self._fallback_analysis(repo_data)

        prompt = ANALYSIS_PROMPT.format(
            name=repo_data.get("name", "Unknown"),
            description=repo_data.get("description", "No description") or "No description",
            language=repo_data.get("language", "Unknown"),
            stars=repo_data.get("stars", 0),
            forks=repo_data.get("forks", 0),
            topics=", ".join(repo_data.get("topics", []) or []),
            owner=repo_data.get("owner", "unknown"),
            file_count=len(repo_data.get("files", []) or []),
            files="\n".join((repo_data.get("files", []) or [])[:30]),
            readme=(repo_data.get("readme", "") or "")[:3000]
        )

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=4096
            )
            text = response.choices[0].message.content
            return self._parse_json_response(text, repo_data)
        except Exception as e:
            print(f"Groq API error: {e}, falling back to template")
            return self._fallback_analysis(repo_data)

    def _parse_json_response(self, text, repo_data):
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            try:
                result = json.loads(json_match.group())
                if self._validate_analysis(result):
                    return result
            except json.JSONDecodeError:
                pass
        return self._fallback_analysis(repo_data)

    def _validate_analysis(self, result):
        required = ["story_slides", "improvements", "build_guide", "resources", "roadmap"]
        return all(k in result for k in required)

    def _fallback_analysis(self, repo_data):
        name = repo_data.get("name", "Project")
        desc = repo_data.get("description", "A software project") or "A software project"
        lang = repo_data.get("language", "Multiple")
        stars = repo_data.get("stars", 0)
        forks = repo_data.get("forks", 0)
        files = repo_data.get("files", []) or []
        readme = repo_data.get("readme", "") or ""

        description_text = desc
        if readme:
            first_line = readme.split('\n')[0].strip().strip('#').strip()
            if first_line:
                description_text = first_line

        return {
            "story_slides": [
                {"title": f"Meet {name}", "subtitle": "Project Overview", "content": f"{description_text}", "icon": "📖"},
                {"title": "Architecture", "subtitle": "How It's Built", "content": f"Built primarily with {lang}. The repository contains {len(files)} tracked files across the codebase.", "icon": "🏗️"},
                {"title": "Key Features", "subtitle": "What Makes It Stand Out", "content": f"⭐ {stars} stars on GitHub · {forks} forks\n• Active development with community contributions\n• Built with {lang} ecosystem", "icon": "⚡"},
                {"title": "Tech Stack", "subtitle": "Tools & Technologies", "content": f"Primary language: {lang}\n\nTopics: {', '.join(repo_data.get('topics', []) or []) or 'Various technologies'}", "icon": "🛠️"},
                {"title": "Project Structure", "subtitle": "Code Organization", "content": f"Top-level structure includes:\n" + "\n".join(f"• {f}" for f in files[:10]) if files else "Repository structure available on GitHub", "icon": "📁"},
                {"title": "Community", "subtitle": "Growth & Engagement", "content": f"★ {stars} GitHub stars · {forks} forks\nOpen source project ready for contributions.", "icon": "👥"},
                {"title": "Get Started", "subtitle": "Your Journey Begins", "content": f"Clone the repo, explore the code, and start contributing. Check the README for detailed setup instructions.", "icon": "🚀"},
            ],
            "improvements": [
                {"title": "Add Comprehensive Tests", "description": "Increase test coverage to ensure code reliability and catch regressions early.", "priority": "High", "effort": "3-5 days"},
                {"title": "Improve Documentation", "description": "Enhance API docs and add more usage examples for new contributors.", "priority": "Medium", "effort": "2-3 days"},
                {"title": "CI/CD Pipeline", "description": "Set up automated testing and deployment pipeline for faster iteration.", "priority": "Medium", "effort": "1-2 days"},
            ],
            "build_guide": {
                "overview": f"Get started with {name} by following these steps.",
                "steps": [
                    {"step": 1, "title": "Clone the Repository", "command": f"git clone https://github.com/{repo_data.get('owner', 'owner')}/{name}.git", "file": ""},
                    {"step": 2, "title": "Install Dependencies", "command": "pip install -r requirements.txt  # or npm install", "file": ""},
                    {"step": 3, "title": "Configure Environment", "command": "cp .env.example .env  # Edit with your settings", "file": ".env"},
                    {"step": 4, "title": "Run the Application", "command": "python main.py  # or npm start", "file": ""},
                ],
                "tech_stack": [lang] if lang != "Multiple" else ["Python", "JavaScript", "TypeScript"]
            },
            "resources": {
                "documentation": [
                    {"title": f"{name} Repository", "url": repo_data.get("url", f"https://github.com/{repo_data.get('owner', 'owner')}/{name}"), "description": "Source code and main documentation"},
                    {"title": "GitHub Guides", "url": "https://guides.github.com", "description": "Learn how to contribute to open source"},
                ],
                "tutorials": [
                    {"title": f"Getting Started with {lang}", "url": "https://www.w3schools.com", "description": f"Learn {lang} fundamentals"},
                    {"title": "Open Source Contribution Guide", "url": "https://opensource.guide", "description": "How to contribute to open source projects"},
                ]
            },
            "roadmap": {
                "milestones": [
                    {"title": "Initial Setup & Exploration", "days": 2, "tasks": ["Clone and run the project locally", "Explore the codebase structure", "Understand the architecture"]},
                    {"title": "Deep Dive", "days": 5, "tasks": ["Read through core modules", "Run existing tests", "Identify key components"]},
                    {"title": "First Contribution", "days": 7, "tasks": ["Find a good first issue", "Set up development environment", "Submit a pull request"]},
                ]
            }
        }
