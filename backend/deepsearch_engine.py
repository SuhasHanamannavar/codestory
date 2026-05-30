import os

RESOURCE_TEMPLATES = {
    "Python": {
        "docs": [
            {"title": "Python Official Documentation", "url": "https://docs.python.org/3/", "description": "Complete Python language reference and standard library docs"},
            {"title": "Real Python Tutorials", "url": "https://realpython.com/", "description": "In-depth Python tutorials for all skill levels"},
        ],
        "tutorials": [
            {"title": "Python for Beginners", "url": "https://www.learnpython.org/", "description": "Interactive Python tutorial for beginners"},
            {"title": "Full Stack Python", "url": "https://www.fullstackpython.com/", "description": "Complete guide to building Python web applications"},
        ]
    },
    "JavaScript": {
        "docs": [
            {"title": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript", "description": "Comprehensive JavaScript reference and guides"},
            {"title": "Node.js Documentation", "url": "https://nodejs.org/docs/latest/api/", "description": "Official Node.js API documentation"},
        ],
        "tutorials": [
            {"title": "JavaScript.info", "url": "https://javascript.info/", "description": "Modern JavaScript tutorial from basics to advanced"},
            {"title": "FreeCodeCamp JavaScript", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", "description": "Interactive JavaScript certification course"},
        ]
    },
    "TypeScript": {
        "docs": [
            {"title": "TypeScript Handbook", "url": "https://www.typescriptlang.org/docs/", "description": "Official TypeScript language documentation"},
            {"title": "React TypeScript Cheatsheet", "url": "https://react-typescript-cheatsheet.netlify.app/", "description": "Best practices for using TypeScript with React"},
        ],
        "tutorials": [
            {"title": "TypeScript Deep Dive", "url": "https://basarat.gitbook.io/typescript/", "description": "Comprehensive TypeScript learning resource"},
            {"title": "Total TypeScript", "url": "https://www.totaltypescript.com/tutorials", "description": "Advanced TypeScript patterns and tutorials"},
        ]
    },
    "default": {
        "docs": [
            {"title": "GitHub Docs", "url": "https://docs.github.com/en", "description": "Official GitHub documentation and guides"},
            {"title": "Open Source Guides", "url": "https://opensource.guide/", "description": "Learn how to run and contribute to open source projects"},
        ],
        "tutorials": [
            {"title": "GitHub Skills", "url": "https://skills.github.com/", "description": "Interactive GitHub learning courses"},
            {"title": "Dev.to Community", "url": "https://dev.to/", "description": "Articles and tutorials from the developer community"},
        ]
    }
}


class DeepSearchEngine:
    def __init__(self):
        self.api_key = os.getenv("DEEPSEARCH_API_KEY", "")

    def search_resources(self, tech_stack, missing_features=None):
        templates = RESOURCE_TEMPLATES
        docs = []
        tutorials = []
        seen_docs = set()
        seen_tutorials = set()

        for tech in (tech_stack or []):
            template = templates.get(tech) or templates.get("default")
            for doc in template["docs"]:
                key = doc["title"]
                if key not in seen_docs:
                    seen_docs.add(key)
                    docs.append(doc)
            for tut in template["tutorials"]:
                key = tut["title"]
                if key not in seen_tutorials:
                    seen_tutorials.add(key)
                    tutorials.append(tut)

        if not docs:
            docs = templates["default"]["docs"]
        if not tutorials:
            tutorials = templates["default"]["tutorials"]

        return {
            "docs": docs[:4],
            "tutorials": tutorials[:4],
            "similar_repos": [],
            "best_practices": []
        }
