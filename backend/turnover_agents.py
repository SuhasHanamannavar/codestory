import os
import json
import re
import math

IMPACT_MAPPER_PROMPT = """You are a Senior Impact Mapper for an IT services company. A developer has resigned. Analyze this graph data and produce a structured impact assessment.

Repo: {repo_name}
Resigning Developer: {developer}

Knowledge Graph Data (modules with owners, risk scores, signals):
{graph_data}

Return ONLY valid JSON:
{{
  "high_risk_modules": [
    {{
      "module": "module_name",
      "risk_score": 0.85,
      "reason": "Single owner with 90%+ commit share",
      "suggested_shadow_owners": ["dev2"],
      "knowledge_loss_percent": 75
    }}
  ],
  "cascade_impact": [
    {{
      "source_module": "module_name",
      "affected_modules": ["dependent_module"],
      "propagation_risk": 0.6
    }}
  ],
  "overall_impact_summary": "2 of 5 modules are critically affected",
  "critical_deadline": "14 days before knowledge fades",
  "recommended_backfill": ["external_hire", "cross_train_team"]
}}

Rules:
- Identify modules where developer has >30% share
- Calculate knowledge_loss_percent based on their share
- Cascade impact: modules that depend on high-risk modules inherit 60% of risk
- Be specific to this data, not generic"""

TRANSFER_SCHEDULER_PROMPT = """You are a Senior Transfer Scheduler for an IT services company. Create an optimized day-by-day 30-day knowledge transfer plan.

Repo: {repo_name}
Resigning Developer: {developer}
Impact Assessment: {impact_summary}
High Risk Modules: {high_risk_modules}

Return ONLY valid JSON:
{{
  "schedule": [
    {{
      "day": 1,
      "phase": "Immediate",
      "focus": "Knowledge harvest",
      "activities": ["Schedule handover meeting", "Document WIP items"],
      "owners_involved": ["dev2"],
      "duration_hours": 4
    }}
  ],
  "total_hours_required": 120,
  "compression_feasible": true,
  "parallel_tracks": ["Documentation", "Code review", "Client briefing"]
}}

Generate 30 days of schedule. Days 1-3: Immediate crisis. Days 4-10: Deep knowledge transfer. Days 11-20: Shadow handover. Days 21-30: Validation & buffer."""

PLAYBOOK_WRITER_PROMPT = """You are a Senior Playbook Writer for an IT services company. Generate two playbooks for knowledge transfer.

Repo: {repo_name}
Resigning Developer: {developer}
Transfer Schedule: {schedule_summary}

Return ONLY valid JSON:
{{
  "technical_playbook": "Markdown format technical handover document...",
  "client_playbook": "Markdown format client-facing summary..."
}}

Technical must cover: architecture, code locations, deployment, testing, monitoring, runbooks.
Client must cover: service impact, timeline, risk mitigation, communication plan."""


class ImpactMapper:
    def __init__(self):
        self.client = None
        api_key = os.getenv("GROQ_API_KEY", "")
        if api_key:
            from groq import Groq
            self.client = Groq(api_key=api_key)

    def analyze(self, repo_name, developer, graph_data):
        if not self.client:
            return self._fallback_impact(graph_data, developer)

        prompt = IMPACT_MAPPER_PROMPT.format(
            repo_name=repo_name,
            developer=developer,
            graph_data=json.dumps(graph_data, indent=2)[:3000]
        )

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=2048
            )
            text = response.choices[0].message.content
            json_match = re.search(r'\{[\s\S]*\}', text)
            if json_match:
                return json.loads(json_match.group())
        except Exception as e:
            print(f"ImpactMapper error: {e}")

        return self._fallback_impact(graph_data, developer)

    def _fallback_impact(self, graph_data, developer):
        nodes = graph_data.get("nodes", [])
        high_risk = []
        cascade = []
        total_knowledge_loss = 0
        module_count = 0

        for node in nodes:
            owners = node.get("owners", [])
            dev_share = 0
            for o in owners:
                if o.get("name", "").lower() == developer.lower():
                    dev_share = o.get("share", 0)

            if dev_share > 0.3:
                share_pct = round(dev_share * 100)
                risk = 0.2 + (dev_share * 0.8)
                high_risk.append({
                    "module": node.get("label", node.get("id", "")),
                    "risk_score": round(min(risk, 1.0), 2),
                    "reason": f"{developer} owns {share_pct}% of this module",
                    "suggested_shadow_owners": [
                        o["name"] for o in owners
                        if o.get("name", "").lower() != developer.lower()
                    ],
                    "knowledge_loss_percent": share_pct
                })
                total_knowledge_loss += share_pct
                module_count += 1

        if module_count > 0:
            avg_loss = total_knowledge_loss / module_count
            overall = f"{module_count} module(s) critically affected, avg knowledge loss {avg_loss:.0f}%"
        else:
            overall = f"{developer} has low ownership concentration — low impact"

        return {
            "high_risk_modules": high_risk,
            "cascade_impact": cascade,
            "overall_impact_summary": overall,
            "critical_deadline": "14 days",
            "recommended_backfill": ["cross_train_team", "documentation_overhaul"]
        }


class TransferScheduler:
    def __init__(self):
        self.client = None
        api_key = os.getenv("GROQ_API_KEY", "")
        if api_key:
            from groq import Groq
            self.client = Groq(api_key=api_key)

    def generate(self, repo_name, developer, impact_result):
        if not self.client:
            return self._fallback_schedule(impact_result, developer)

        high_risk = impact_result.get("high_risk_modules", [])
        summary = impact_result.get("overall_impact_summary", "")

        prompt = TRANSFER_SCHEDULER_PROMPT.format(
            repo_name=repo_name,
            developer=developer,
            impact_summary=summary,
            high_risk_modules=json.dumps(high_risk, indent=2)
        )

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=3072
            )
            text = response.choices[0].message.content
            json_match = re.search(r'\{[\s\S]*\}', text)
            if json_match:
                return json.loads(json_match.group())
        except Exception as e:
            print(f"TransferScheduler error: {e}")

        return self._fallback_schedule(impact_result)

    def _fallback_schedule(self, impact_result, developer):
        high_risk = impact_result.get("high_risk_modules", [])
        modules = [m["module"] for m in high_risk]
        shadow_owners = set()
        for m in high_risk:
            for s in m.get("suggested_shadow_owners", []):
                shadow_owners.add(s)
        shadow_list = list(shadow_owners) if shadow_owners else ["team_member"]

        schedule = []

        phases = [
            (1, 3, "Immediate Crisis", "Knowledge harvest & documentation"),
            (4, 10, "Deep Transfer", "Pair programming & code walkthrough"),
            (11, 20, "Shadow Handover", "Shadow owner takes over tasks"),
            (21, 30, "Validation", "Review & buffer period"),
        ]

        day_num = 1
        for start, end, phase, focus in phases:
            for d in range(start, end + 1):
                activities = []
                if phase == "Immediate Crisis":
                    if d == 1:
                        activities = [f"Schedule handover meeting for {', '.join(modules)}", "Document all WIP items", f"Identify {', '.join(shadow_list)} as shadow owners"]
                    elif d == 2:
                        activities = ["Review open PRs and branches", f"Tag {developer}'s commits for review", "Create knowledge inventory checklist"]
                    else:
                        activities = ["Begin architecture documentation", f"Record {developer}'s deployment knowledge", "Document environment setup"]
                elif phase == "Deep Transfer":
                    activities = [
                        f"Pair programming on {modules[(d - 4) % len(modules)] if modules else 'core'}",
                        f"Walkthrough: {modules[(d - 4) % len(modules)] if modules else 'core'} architecture",
                        f"{', '.join(shadow_list)} shadows {developer} on daily tasks"
                    ]
                elif phase == "Shadow Handover":
                    activities = [
                        f"{', '.join(shadow_list)} leads {modules[(d - 11) % len(modules)] if modules else 'core'} tasks",
                        "Code review shadow owner's changes",
                        "Update runbooks with findings"
                    ]
                else:
                    activities = [
                        "Verify all tasks transferred successfully",
                        "Final knowledge review session",
                        "Update bus factor documentation"
                    ]

                schedule.append({
                    "day": day_num,
                    "phase": phase,
                    "focus": focus if d == start else "",
                    "activities": activities[:3],
                    "owners_involved": shadow_list,
                    "duration_hours": 6 if phase in ["Immediate Crisis", "Deep Transfer"] else 3
                })
                day_num += 1

        return {
            "schedule": schedule,
            "total_hours_required": day_num * 4,
            "compression_feasible": True,
            "parallel_tracks": ["Documentation", "Code review", "Client briefing"]
        }


class PlaybookWriter:
    def __init__(self):
        self.client = None
        api_key = os.getenv("GROQ_API_KEY", "")
        if api_key:
            from groq import Groq
            self.client = Groq(api_key=api_key)

    def generate(self, repo_name, developer, impact_result, schedule_result):
        if not self.client:
            return self._fallback_playbooks(repo_name, developer, impact_result)

        schedule = schedule_result.get("schedule", [])
        schedule_summary = f"{len(schedule)} days planned, {schedule_result.get('total_hours_required', 0)} total hours"

        prompt = PLAYBOOK_WRITER_PROMPT.format(
            repo_name=repo_name,
            developer=developer,
            schedule_summary=schedule_summary
        )

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=3072
            )
            text = response.choices[0].message.content
            json_match = re.search(r'\{[\s\S]*\}', text)
            if json_match:
                return json.loads(json_match.group())
        except Exception as e:
            print(f"PlaybookWriter error: {e}")

        return self._fallback_playbooks(repo_name, developer, impact_result)

    def _fallback_playbooks(self, repo_name, developer, impact_result):
        high_risk = impact_result.get("high_risk_modules", [])
        modules = ", ".join([m["module"] for m in high_risk]) if high_risk else "core modules"

        technical = f"""# Technical Handover Playbook — {developer} / {repo_name}

## 1. Architecture Overview
- **Affected modules**: {modules}
- **Risk level**: {impact_result.get('overall_impact_summary', 'Medium')}
- **Deadline**: {impact_result.get('critical_deadline', '14 days')}

## 2. Immediate Actions (Days 1-3)
- Schedule code walkthrough sessions for {modules}
- Document all environment configurations, secrets, and deployment scripts
- Tag and document all in-progress feature branches
- Record CI/CD pipeline configuration and release process

## 3. Code Handover (Days 4-10)
- Review all open PRs authored by {developer} — merge or document
- Transfer code ownership in GitHub to shadow owners
- Document API contracts, database schemas, and integration points
- Create architecture decision records (ADRs) for key components

## 4. Testing & Validation (Days 11-20)
- Shadow owners run test suites and verify coverage
- Perform pair programming on complex modules
- Validate deployment process end-to-end
- Update integration test documentation

## 5. Monitoring & Runbooks (Days 21-30)
- Document monitoring dashboards and alert configurations
- Create incident response runbooks for {modules}
- Update on-call rotation documentation
- Final knowledge review and sign-off

## Risk Mitigation
- **Critical path**: {modules} dependency chain
- **Backup plan**: {', '.join(impact_result.get('recommended_backfill', ['cross-training']))}
- **Escalation**: Immediate escalation if knowledge transfer falls behind by >3 days"""

        client = f"""# Client-Facing Transition Summary — {repo_name}

## Transition Overview
**Departing team member**: {developer}
**Notice period**: 30 days
**Impact assessment**: {impact_result.get('overall_impact_summary', 'Under control')}

## Service Continuity Plan
- **No disruption** to existing service levels during transition
- Knowledge transfer is structured across 4 phases over 30 days
- Shadow owners identified and being trained on {modules}

## Timeline
| Phase | Duration | Focus |
|-------|----------|-------|
| Immediate | Days 1-3 | Knowledge documentation |
| Deep Transfer | Days 4-10 | Hands-on handover |
| Shadow Period | Days 11-20 | New owner takeover |
| Validation | Days 21-30 | Stability verification |

## Risk Mitigation
- All critical knowledge documented in runbooks
- Deployment processes verified by multiple team members
- Weekly status updates during transition period

## Communication
- Point of contact for technical queries: Engineering Lead
- Point of contact for delivery queries: Delivery Manager
- Weekly transition progress reports shared with stakeholders"""

        return {
            "technical_playbook": technical,
            "client_playbook": client
        }
