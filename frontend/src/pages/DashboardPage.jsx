import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import MatrixBackground from '../components/MatrixBackground'
import RepoLoader from '../components/RepoLoader'
import ResignationForm from '../components/ResignationForm'
import GraphView from '../components/GraphView'
import RiskSummaryPanel from '../components/RiskSummaryPanel'
import PlaybooksPanel from '../components/PlaybooksPanel'
import NotionSaveButton from '../components/NotionSaveButton'
import NodeDetailsPanel from '../components/NodeDetailsPanel'
import { apiPost, apiGet } from '../lib/apiClient'

function normalizeGraph(input) {
  // Supports multiple backend shapes during integration.
  if (!input) return null
  if (input.nodes && input.edges) return input
  if (input.graph?.nodes && input.graph?.edges) return input.graph
  if (input.data?.nodes && input.data?.edges) return input.data
  return null
}

function placeholderGraph(repoUrl) {
  const seed = repoUrl ? repoUrl.length : 7
  const nodes = [
    { id: 'api', label: 'API', risk_score: 0.22, owners: [{ name: 'alice', share: 0.6 }, { name: 'bob', share: 0.4 }] },
    { id: 'ui', label: 'Frontend', risk_score: 0.18, owners: [{ name: 'alice', share: 0.35 }, { name: 'cara', share: 0.65 }] },
    { id: 'db', label: 'Data Layer', risk_score: 0.28, owners: [{ name: 'bob', share: 0.7 }, { name: 'alice', share: 0.3 }] },
    { id: 'auth', label: 'Auth', risk_score: 0.33, owners: [{ name: 'dave', share: 0.55 }, { name: 'alice', share: 0.45 }] },
    { id: 'billing', label: 'Billing', risk_score: 0.41 + (seed % 5) * 0.02, owners: [{ name: 'cara', share: 0.8 }, { name: 'bob', share: 0.2 }] }
  ]
  const edges = [
    { source: 'ui', target: 'api' },
    { source: 'api', target: 'db' },
    { source: 'api', target: 'auth' },
    { source: 'api', target: 'billing' }
  ]
  return { nodes, edges }
}

function interpolateGraphRisk(before, after, t) {
  if (!before || !after) return after || before
  const afterById = new Map((after.nodes || []).map((n) => [String(n.id), n]))
  const nodes = (before.nodes || []).map((n) => {
    const a = afterById.get(String(n.id))
    if (!a) return n
    const b = Number.isFinite(n.risk_score ?? n.risk) ? (n.risk_score ?? n.risk) : 0
    const c = Number.isFinite(a.risk_score ?? a.risk) ? (a.risk_score ?? a.risk) : b
    const risk_score = b + (c - b) * t
    return { ...a, risk_score }
  })
  return { ...after, nodes }
}

export default function DashboardPage() {
  const [repoUrl, setRepoUrl] = useState(() => localStorage.getItem('codestory_url') || '')
  const [loadingRepo, setLoadingRepo] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [graph, setGraph] = useState(null)
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [simulation, setSimulation] = useState(null)
  const [rescuePlan, setRescuePlan] = useState(null)

  const effectiveGraph = useMemo(() => {
    if (graph) return graph
    if (repoUrl) return placeholderGraph(repoUrl)
    return null
  }, [graph, repoUrl])

  useEffect(() => {
    if (repoUrl) localStorage.setItem('codestory_url', repoUrl)
  }, [repoUrl])

  const loadRepo = async (url) => {
    setRepoUrl(url)
    setSelectedNodeId(null)
    setRescuePlan(null)
    setSimulation(null)

    setLoadingRepo(true)
    try {
      const data = await apiPost('/api/ingest', { github_url: url })
      
      if (data.status === 'enqueued') {
        let jobFinished = false;
        let finalGraph = null;
        while (!jobFinished) {
          await new Promise(r => setTimeout(r, 2000));
          const jobData = await apiGet(`/api/job/${data.job_id}`);
          if (jobData.status === 'finished') {
            const graphData = await apiGet(`/api/graph/${data.job_id}`);
            finalGraph = normalizeGraph(graphData);
            jobFinished = true;
          } else if (jobData.status === 'failed') {
            throw new Error(jobData.error || 'Ingestion failed');
          }
        }
        setGraph(finalGraph);
      } else {
        const g = normalizeGraph(data)
        setGraph(g)
      }
    } catch (e) {
      alert(`Ingestion failed: ${e.message}`);
      setGraph({ nodes: [], edges: [] });
    } finally {
      setLoadingRepo(false)
    }
  }

  const triggerResignation = async (developer) => {
    if (!repoUrl) return
    setSimulating(true)
    setRescuePlan(null)

    try {
      // Contract suggestion (Guru Raj): POST /api/simulate_resignation { github_url, developer }
      // Expected: { before:{graph}, after:{graph}, deltas:[...] }
      const data = await apiPost('/api/simulate_resignation', { github_url: repoUrl, developer })
      const before = normalizeGraph(data?.before) || effectiveGraph
      const after = normalizeGraph(data?.after) || normalizeGraph(data?.graph) || before

      setSimulation({
        deltas: data?.deltas || [],
        before,
        after
      })

      // Smooth risk transition with ease-out for the "wow" moment.
      const start = performance.now()
      const dur = 1100
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur)
        const t = 1 - Math.pow(1 - p, 3)
        setGraph(interpolateGraphRisk(before, after, t))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)

      // Orchestrated rescue plan (Pavan): POST /api/rescue_plan { github_url, developer }
      // Expected: { impact_map, transfer_schedule_30d, playbooks:{technical,client} }
      const plan = await apiPost('/api/rescue_plan', { github_url: repoUrl, developer })
      setRescuePlan(plan)
    } catch {
      // If orchestration not ready yet, keep UI stable.
    } finally {
      setSimulating(false)
    }
  }

  const saveToNotion = async () => {
    if (!repoUrl || !rescuePlan) throw new Error('Run a simulation first')
    // Contract suggestion (Pavan): POST /api/notion/save { github_url, rescue_plan }
    return apiPost('/api/notion/save', { github_url: repoUrl, rescue_plan: rescuePlan })
  }

  const playbooks = rescuePlan?.playbooks

  return (
    <div className="min-h-screen bg-dark-bg">
      <MatrixBackground />
      <Navbar />

      <div className="pt-24 pb-10 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6">
            <RepoLoader initialUrl={repoUrl} loading={loadingRepo} onLoad={loadRepo} />

            <div className="grid lg:grid-cols-[320px_1fr_360px] gap-6 items-start">
              <div className="space-y-4">
                <ResignationForm loading={simulating} onTrigger={triggerResignation} />
                <NodeDetailsPanel graph={effectiveGraph} selectedNodeId={selectedNodeId} />
              </div>

              <GraphView
                graph={effectiveGraph}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />

              <div className="space-y-4">
                <RiskSummaryPanel
                  title={simulation ? 'Risk Summary (After)' : 'Risk Summary'}
                  graph={effectiveGraph}
                  deltas={simulation?.deltas}
                />

                <NotionSaveButton disabled={!rescuePlan} onSave={saveToNotion} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Rescue Playbooks</h2>
                <div className="text-xs text-gray-500 font-mono">
                  {rescuePlan ? 'generated' : 'run simulation to generate'}
                </div>
              </div>
              <div className="mt-4">
                <PlaybooksPanel playbooks={playbooks} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
