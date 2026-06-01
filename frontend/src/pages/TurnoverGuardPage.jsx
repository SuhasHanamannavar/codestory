import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import Navbar from '../components/Navbar'
import MatrixBackground from '../components/MatrixBackground'
import AmbientGlow from '../components/AmbientGlow'
import GridBackground from '../components/GridBackground'
import TurnoverHero from '../components/TurnoverHero'
import TurnoverAgentPipeline from '../components/TurnoverAgentPipeline'
import RescueTimeline from '../components/RescueTimeline'
import ImpactSummary from '../components/ImpactSummary'
import GraphView from '../components/GraphView'
import RiskSummaryPanel from '../components/RiskSummaryPanel'
import PlaybooksPanel from '../components/PlaybooksPanel'
import TerminalLoading from '../components/TerminalLoading'
import { apiPost } from '../lib/apiClient'

function normalizeGraph(input) {
  if (!input) return null
  if (input.nodes && input.edges) return input
  if (input.graph?.nodes && input.graph?.edges) return input.graph
  return null
}

function interpolateRisk(before, after, t) {
  if (!before || !after) return after || before
  const smooth = 1 - Math.pow(1 - t, 3)
  const afterById = new Map((after.nodes || []).map((n) => [String(n.id), n]))
  const nodes = (before.nodes || []).map((n) => {
    const a = afterById.get(String(n.id))
    if (!a) return n
    const b = Number.isFinite(n.risk_score ?? n.risk) ? (n.risk_score ?? n.risk) : 0
    const c = Number.isFinite(a.risk_score ?? a.risk) ? (a.risk_score ?? a.risk) : b
    return { ...a, risk_score: b + (c - b) * smooth }
  })
  return { ...after, nodes }
}

function StorySlide({ slide, meta }) {
  const content = slide.content || ''
  const isList = content.includes('\n') && (content.includes('•') || content.includes('-') || content.includes('*'))
  const items = isList ? content.split('\n').filter(line => line.trim()) : []
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="glass-card rounded-2xl p-8 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">{slide.icon || '📖'}</div>
        <h2 className="text-3xl font-bold text-white mb-2">{slide.title || 'Loading...'}</h2>
        {slide.subtitle && <p className="text-primary-purpleLight text-lg">{slide.subtitle}</p>}
      </div>
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.slice(0, 8).map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="flex items-start gap-3 text-lg text-gray-300">
              <span className="text-primary-purple">•</span>
              <span className="leading-relaxed">{item.replace(/^[•\-*]\s*/, '')}</span>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-lg text-gray-300 leading-relaxed text-center whitespace-pre-wrap">{content || 'Analyzing...'}</p>
      )}
    </motion.div>
  )
}

function ImprovementsTab({ improvements = [] }) {
  if (!improvements || !improvements.length) return <div className="text-center py-12 text-gray-400"><p className="text-xl">Loading improvements...</p></div>
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold gradient-text text-center mb-8">AI Improvement Suggestions</h2>
      {['High', 'Medium', 'Low'].map(priority => {
        const items = improvements.filter(i => i.priority === priority)
        if (!items.length) return null
        const color = priority === 'High' ? 'red' : priority === 'Medium' ? 'yellow' : 'green'
        return (
          <div key={priority}>
            <h3 className={`text-xl font-bold text-${color}-400 mb-4`}>{priority === 'High' ? '🔴' : priority === 'Medium' ? '🟡' : '🟢'} {priority} Priority</h3>
            <div className="grid gap-4">
              {items.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -32 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08, duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className={`glass-card rounded-xl p-6 border border-${color}-500/30`}>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${color}-500/20 text-${color}-400 border border-${color}-500/50`}>{priority}</span>
                  </div>
                  <p className="text-gray-400 mb-3">{item.description}</p>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">{item.effort || '1 day'}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function BuildGuideTab({ guide = {} }) {
  const steps = guide.steps || []
  if (!steps.length) return <div className="text-center py-12 text-gray-400"><p className="text-xl">Loading build guide...</p></div>
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold gradient-text text-center mb-8">Build Guide</h2>
      <div className="space-y-4">
        {steps.map((step, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12, duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="glass-card rounded-xl overflow-hidden">
            <div className="flex items-stretch">
              <div className="w-16 bg-gradient-primary flex items-center justify-center text-2xl font-bold">{step.step || i + 1}</div>
              <div className="flex-1 p-6">
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                {(step.command || step.code) && (
                  <div className="bg-dark-bg rounded-lg p-4 border border-dark-border overflow-x-auto">
                    <pre className="text-sm text-primary-purpleLight font-mono">{step.command || step.code}</pre>
                  </div>
                )}
                {step.file && <p className="text-gray-500 text-sm mt-2">📁 {step.file}</p>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {(guide.tech_stack || []).length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          {guide.tech_stack.map((tech, i) => (
            <span key={i} className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm">{tech}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function ResourcesTab({ resources = {} }) {
  const docs = resources.documentation || []
  const tutorials = resources.tutorials || []
  const hasContent = docs.length > 0 || tutorials.length > 0
  if (!hasContent) return <div className="text-center py-12 text-gray-400"><p className="text-xl">Loading resources...</p></div>
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold gradient-text text-center mb-8">Resources</h2>
      {docs.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Documentation</h3>
          {docs.map((doc, i) => (
            <motion.a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="glass-card rounded-xl p-4 flex items-center gap-4 cursor-pointer mb-3">
              <div className="flex-1"><h4 className="text-white font-bold">{doc.title}</h4><p className="text-gray-400 text-sm">{doc.description}</p></div>
            </motion.a>
          ))}
        </div>
      )}
      {tutorials.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Tutorials</h3>
          {tutorials.map((t, i) => (
            <motion.a key={i} href={t.url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="glass-card rounded-xl p-4 flex items-center gap-4 cursor-pointer mb-3">
              <div className="flex-1"><h4 className="text-white font-bold">{t.title}</h4><p className="text-gray-400 text-sm">{t.description}</p></div>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  )
}

function RoadmapTab({ roadmap = {} }) {
  const milestones = roadmap.milestones || []
  if (!milestones.length) return <div className="text-center py-12 text-gray-400"><p className="text-xl">Loading roadmap...</p></div>
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold gradient-text text-center mb-8">Roadmap</h2>
      {milestones.map((ms, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -32 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1, duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-xl font-bold">{i + 1}</div>
            <div><h3 className="text-xl font-bold text-white">{ms.title}</h3><span className="text-gray-400 text-sm">{ms.days || 7} days</span></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(ms.tasks || []).map((task, j) => (
              <span key={j} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">{task}</span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

const TAB_ICONS = { story: '📖', improvements: '💡', guide: '🛠️', resources: '📚', roadmap: '🗺️', analysis: '📊', rescue: '🛡️' }

export default function TurnoverGuardPage() {
  const [repoUrl, setRepoUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [graph, setGraph] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [impactMap, setImpactMap] = useState(null)
  const [schedule, setSchedule] = useState([])
  const [playbooks, setPlaybooks] = useState(null)
  const [simulation, setSimulation] = useState(null)
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [devName, setDevName] = useState('')
  const [activeTab, setActiveTab] = useState('story')
  const [notionUrl, setNotionUrl] = useState(null)
  const [storyData, setStoryData] = useState(null)
  const [storyMeta, setStoryMeta] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slideDir, setSlideDir] = useState(1)
  const [loading, setLoading] = useState(false)

  const nextSlide = useCallback(() => {
    const slides = storyData?.story_slides || []
    if (currentSlide < slides.length - 1) { setSlideDir(1); setCurrentSlide(s => s + 1) }
    if (currentSlide === slides.length - 1) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
  }, [currentSlide, storyData])

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) { setSlideDir(-1); setCurrentSlide(s => s - 1) }
  }, [currentSlide])

  useEffect(() => {
    if (activeTab !== 'story' || !storyData) return
    const timer = setTimeout(() => nextSlide(), 6000)
    return () => clearTimeout(timer)
  }, [activeTab, currentSlide, storyData, nextSlide])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeTab !== 'story') return
      if (e.key === 'ArrowRight') nextSlide()
      if (e.key === 'ArrowLeft') prevSlide()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, nextSlide, prevSlide])

  const handleAnalyze = async (e) => {
    e?.preventDefault()
    if (!repoUrl.trim()) return
    setAnalyzing(true)
    setLoading(true)
    setGraph(null); setMetrics(null); setImpactMap(null)
    setSchedule([]); setPlaybooks(null); setSimulation(null); setNotionUrl(null)
    setStoryData(null); setStoryMeta(null); setCurrentSlide(0)

    try {
      const results = await Promise.allSettled([
        apiPost('/api/analyze', { github_url: repoUrl }),
        apiPost('/api/turnover/analyze', { github_url: repoUrl }),
      ])

      const storyResult = results[0]
      if (storyResult.status === 'fulfilled' && storyResult.value?.success) {
        setStoryData(storyResult.value.analysis)
        setStoryMeta(storyResult.value.repo_meta)
        setActiveTab('story')
      }

      const turnoverResult = results[1]
      if (turnoverResult.status === 'fulfilled') {
        const g = normalizeGraph(turnoverResult.value)
        setGraph(g)
        setMetrics(turnoverResult.value.metrics)
      }
    } catch (err) {
      alert(`Analysis failed: ${err.message}`)
    } finally {
      setAnalyzing(false)
      setLoading(false)
    }
  }

  const handleAnalyzeAnother = () => {
    setGraph(null); setMetrics(null); setImpactMap(null)
    setSchedule([]); setPlaybooks(null); setSimulation(null); setNotionUrl(null)
    setStoryData(null); setStoryMeta(null); setCurrentSlide(0)
    setRepoUrl('')
  }

  const handleSimulate = async (e) => {
    e?.preventDefault()
    if (!devName.trim() || !repoUrl) return
    setSimulating(true)
    setPlaybooks(null)
    setNotionUrl(null)
    try {
      const data = await apiPost('/api/turnover/simulate', { github_url: repoUrl, developer: devName })
      const before = normalizeGraph(data?.before) || graph
      const after = normalizeGraph(data?.after) || before
      setSimulation({ deltas: data?.deltas || [], before, after })
      setImpactMap(data)

      const start = performance.now()
      const dur = 1200
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur)
        setGraph(interpolateRisk(before, after, p))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)

      const rescue = await apiPost('/api/turnover/rescue', { github_url: repoUrl, developer: devName })
      setImpactMap(rescue.impact_map)
      setSchedule(rescue.transfer_schedule_30d || [])
      setPlaybooks(rescue.playbooks)
      setActiveTab('rescue')
    } catch {}
    finally { setSimulating(false) }
  }

  const handleNotionSave = async () => {
    try {
      const rescueData = { impact_map: impactMap, transfer_schedule_30d: schedule, playbooks }
      const result = await apiPost('/api/turnover/notion', { github_url: repoUrl, rescue_plan: rescueData })
      setNotionUrl(result.notion_page_url || result.url)
    } catch (err) { alert(`Notion save failed: ${err.message}`) }
  }

  const hasResults = !!graph || !!storyData
  const slides = storyData?.story_slides || []
  const totalSlides = Math.max(slides.length, 7)
  const analysis = storyData || {}

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-deep)' }}>
        <MatrixBackground />
        <AmbientGlow />
        <GridBackground />
        <Navbar />
        <TerminalLoading repoName={repoUrl.split('/').pop()} />
      </div>
    )
  }

  if (!hasResults) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-deep)' }}>
        <MatrixBackground />
        <AmbientGlow />
        <GridBackground />
        <Navbar />
        <div className="pt-24 pb-10 px-4 relative" style={{ zIndex: 20 }}>
          <div className="max-w-4xl mx-auto">
            <TurnoverHero />
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="glass rounded-2xl p-4 mb-6">
              <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-3 items-center">
                <div className="flex-1 w-full">
                  <input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/owner/repo" className="w-full px-4 py-3 rounded-xl text-sm glow-input text-white placeholder-gray-500" />
                </div>
                <motion.button type="submit" disabled={analyzing || !repoUrl.trim()} whileHover={!analyzing && repoUrl.trim() ? { scale: 1.03 } : {}} whileTap={!analyzing && repoUrl.trim() ? { scale: 0.97 } : {}} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-primary disabled:opacity-50 disabled:cursor-not-allowed">
                  {analyzing ? 'Analyzing...' : 'Analyze Repository'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'story', label: 'Story' },
    { id: 'improvements', label: 'Improvements' },
    { id: 'guide', label: 'Guide' },
    { id: 'resources', label: 'Resources' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'analysis', label: 'Graph & Risk' },
    { id: 'rescue', label: 'Rescue Plan' },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-deep)' }}>
      <MatrixBackground />
      <AmbientGlow />
      <GridBackground />
      <Navbar />
      <div className="pt-24 pb-10 px-4 relative" style={{ zIndex: 20 }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text">
              {storyMeta?.name || 'Repository'} Analysis
            </h2>
            <motion.button onClick={handleAnalyzeAnother} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="px-4 py-2 rounded-xl text-sm font-medium glass text-gray-400 hover:text-white" >
              + Analyze Another
            </motion.button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.12, ease: [0.34, 1.56, 0.64, 1] }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-gradient-primary text-white shadow-lg shadow-primary-purple/25' : 'glass text-gray-400 hover:text-white'}`}
              >
                {TAB_ICONS[tab.id] || ''} {tab.label}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'story' && (
              <motion.div key="story" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <div className="mb-6">
                  <div className="flex gap-2 justify-center">
                    {Array.from({ length: totalSlides }).map((_, i) => (
                      <motion.button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-gradient-primary' : 'w-2 bg-gray-700'}`} whileHover={{ scale: 1.2 }} />
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <AnimatePresence mode="wait" custom={slideDir}>
                    <motion.div key={currentSlide} custom={slideDir} variants={{ enter: (dir) => ({ x: dir > 0 ? 120 : -120, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (dir) => ({ x: dir > 0 ? -120 : 120, opacity: 0 }) }} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                      <StorySlide slide={slides[currentSlide] || {}} meta={storyMeta || {}} />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="flex justify-between items-center mt-8">
                  <motion.button onClick={prevSlide} disabled={currentSlide === 0} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 rounded-xl glass-card disabled:opacity-30 disabled:cursor-not-allowed">Previous</motion.button>
                  <span className="text-gray-400 font-mono">{currentSlide + 1} / {totalSlides}</span>
                  <motion.button onClick={nextSlide} disabled={currentSlide === totalSlides - 1} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 rounded-xl bg-gradient-primary disabled:opacity-30 disabled:cursor-not-allowed">Next</motion.button>
                </div>
              </motion.div>
            )}

            {activeTab === 'improvements' && <motion.div key="improvements" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}><ImprovementsTab improvements={analysis?.improvements || []} /></motion.div>}
            {activeTab === 'guide' && <motion.div key="guide" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}><BuildGuideTab guide={analysis?.build_guide || {}} /></motion.div>}
            {activeTab === 'resources' && <motion.div key="resources" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}><ResourcesTab resources={analysis?.resources || {}} /></motion.div>}
            {activeTab === 'roadmap' && <motion.div key="roadmap" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}><RoadmapTab roadmap={analysis?.roadmap || {}} /></motion.div>}

            {activeTab === 'analysis' && (
              <motion.div key="analysis" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
                  <GraphView graph={graph} selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} />
                  <div className="space-y-4">
                    <ImpactSummary impactMap={impactMap} metrics={metrics} />
                    <div className="glass-card rounded-2xl p-4">
                      <h3 className="text-sm font-semibold tracking-wide text-gray-200 mb-3">Simulate Resignation</h3>
                      <form onSubmit={handleSimulate} className="flex flex-col gap-3">
                        <input value={devName} onChange={(e) => setDevName(e.target.value)} placeholder="Developer name (e.g., priya)" className="w-full px-4 py-3 rounded-xl text-sm glow-input text-white placeholder-gray-500" />
                        <motion.button type="submit" disabled={simulating || !devName.trim() || !graph} whileHover={!simulating && devName.trim() && graph ? { scale: 1.03 } : {}} whileTap={!simulating && devName.trim() && graph ? { scale: 0.97 } : {}} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-primary disabled:opacity-50 disabled:cursor-not-allowed">
                          {simulating ? 'Simulating...' : 'Trigger Resignation'}
                        </motion.button>
                      </form>
                    </div>
                    <RiskSummaryPanel title={simulation ? 'Risk (After)' : 'Risk Summary'} graph={graph} deltas={simulation?.deltas} />
                    <TurnoverAgentPipeline active={analyzing || simulating} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'rescue' && (
              <motion.div key="rescue" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <div className="space-y-6">
                  <RescueTimeline schedule={schedule} />
                  <PlaybooksPanel playbooks={playbooks} />
                  <div className="flex items-center justify-center gap-4">
                    <motion.button onClick={handleNotionSave} disabled={!playbooks} whileHover={playbooks ? { scale: 1.03 } : {}} whileTap={playbooks ? { scale: 0.97 } : {}} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                      Save to Notion
                    </motion.button>
                    {notionUrl && (
                      <motion.a href={notionUrl} target="_blank" rel="noreferrer" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-sm text-primary-purpleLight hover:text-white transition-colors">Open Notion Page →</motion.a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
