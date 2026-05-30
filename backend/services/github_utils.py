import re


def parse_github_url(url: str):
    match = re.search(r"github\.com/([^/]+)/([^/]+?)(?:/.*)?$", url)
    if not match:
        return None, None
    owner = match.group(1)
    repo = match.group(2).replace(".git", "")
    return owner, repo
