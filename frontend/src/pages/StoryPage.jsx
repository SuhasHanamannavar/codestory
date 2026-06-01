import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import Navbar from '../components/Navbar'
import MatrixBackground from '../components/MatrixBackground'
import AmbientGlow from '../components/AmbientGlow'
import GridBackground from '../components/GridBackground'
import TerminalLoading from '../components/TerminalLoading'

const tabs = [
  { id: 'story', label: 'Story', icon: '📖' },
  { id: 'improvements', label: 'Improvements', icon: '💡' },
  { id: 'guide', label: 'Guide', icon: '🛠️' },
  { id: 'resources', label: 'Resources', icon: '📚' },
  { id: 'roadmap', label: 'Roadmap', icon: '🗺️' }
]

function StorySlide({ slide, meta }) {
  const content = slide.content || ''
  const isList = content.includes('\n') && (content.includes('•') || content.includes('-') || content.includes('*'))
  const items = isList ? content.split('\n').filter(line => line.trim()) : []
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 24 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-elevated p-8 max-w-4xl mx-auto"
    >
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">{slide.icon || '📖'}</div>
        <h2 className="text-3xl font-bold text-white mb-2">{slide.title || 'Loading...'}</h2>
        {slide.subtitle && <p className="text-primary-purpleLight text-lg">{slide.subtitle}</p>}
      </div>
      
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.slice(0, 8).map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-3 text-lg text-gray-300"
            >
              <span className="text-primary-purple">•</span>
              <span className="leading-relaxed">{item.replace(/^[•\-*]\s*/, '')}</span>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-lg text-gray-300 leading-relaxed text-center whitespace-pre-wrap">{content || 'Analyzing...'}</p>
      )}
      
      {slide.title?.toLowerCase().includes('metrics') && (
        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <span className="px-4 py-2 bg-primary-purple/20 rounded-full text-primary-purpleLight border border-primary-purple/30">{meta.language || 'Code'}</span>
          <span className="px-4 py-2 bg-yellow-500/20 rounded-full text-yellow-400 border border-yellow-500/30">⭐ {meta.stars} stars</span>
          <span className="px-4 py-2 bg-blue-500/20 rounded-full text-blue-400 border border-blue-500/30">🍴 {meta.forks} forks</span>
        </div>
      )}
    </motion.div>
  )
}

const hoverSpring = { type: 'spring', stiffness: 400, damping: 25 }

function ImprovementsTab({ improvements = [] }) {
  if (!improvements || !improvements.length) return <div className="text-center py-12 text-gray-400"><p className="text-xl">Loading improvements...</p></div>
  
  const highPriority = improvements.filter(i => i.priority === 'High')
  const mediumPriority = improvements.filter(i => i.priority === 'Medium')
  const lowPriority = improvements.filter(i => i.priority === 'Low')
  
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold gradient-text mb-2">AI Improvement Suggestions</h2>
        <p className="text-gray-400">Prioritized by impact and effort</p>
      </motion.div>
      
      {highPriority.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">🔴 High Priority</h3>
          <div className="grid gap-4 mb-6">
            {highPriority.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.02 }}
                className="glass-card-elevated p-6 border border-red-500/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/50">High</span>
                </div>
                <p className="text-gray-400 mb-3">{item.description}</p>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">{item.effort || '1 day'}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {mediumPriority.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">🟡 Medium Priority</h3>
          <div className="grid gap-4 mb-6">
            {mediumPriority.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.02 }}
                className="glass-card-elevated p-6 border border-yellow-500/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">Medium</span>
                </div>
                <p className="text-gray-400 mb-3">{item.description}</p>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">{item.effort || '1 day'}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {lowPriority.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">🟢 Low Priority</h3>
          <div className="grid gap-4">
            {lowPriority.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.02 }}
                className="glass-card-elevated p-6 border border-green-500/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/50">Low</span>
                </div>
                <p className="text-gray-400 mb-3">{item.description}</p>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">{item.effort || '1 day'}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BuildGuideTab({ guide = {} }) {
  const steps = guide.steps || []
  const techStack = guide.tech_stack || []
  if (!steps || !steps.length) return <div className="text-center py-12 text-gray-400"><p className="text-xl">Loading build guide...</p></div>
  
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-2">🛠️ Build Guide</h2>
        <p className="text-gray-400">{guide.overview || 'Setup instructions'}</p>
      </motion.div>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.12, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.01 }}
            className="glass-card-elevated overflow-hidden"
          >
            <div className="flex items-stretch">
              <div className="w-16 bg-gradient-primary flex items-center justify-center text-2xl font-bold">{step.step || index + 1}</div>
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
      {techStack.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          {techStack.map((tech, i) => (
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
  
  const appear = { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={appear} className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-2">📚 Resources</h2>
      </motion.div>
      {docs.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">📖 Documentation</h3>
          <div className="grid gap-3">
            {docs.map((doc, i) => (
              <motion.a
                key={i}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, ...appear }}
                whileHover={{ scale: 1.02 }}
                className="glass-card-elevated p-4 flex items-center gap-4 cursor-pointer"
              >
                <div className="text-2xl">📄</div>
                <div className="flex-1"><h4 className="text-white font-bold">{doc.title}</h4><p className="text-gray-400 text-sm">{doc.description}</p></div>
              </motion.a>
            ))}
          </div>
        </div>
      )}
      {tutorials.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">🎓 Tutorials</h3>
          <div className="grid gap-3">
            {tutorials.map((t, i) => (
              <motion.a
                key={i}
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, ...appear }}
                whileHover={{ scale: 1.02 }}
                className="glass-card-elevated p-4 flex items-center gap-4 cursor-pointer"
              >
                <div className="text-2xl">🎥</div>
                <div className="flex-1"><h4 className="text-white font-bold">{t.title}</h4><p className="text-gray-400 text-sm">{t.description}</p></div>
              </motion.a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RoadmapTab({ roadmap = {} }) {
  const milestones = roadmap.milestones || []
  if (!milestones || !milestones.length) return <div className="text-center py-12 text-gray-400"><p className="text-xl">Loading roadmap...</p></div>
  
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-2">🗺️ Roadmap</h2>
      </motion.div>
      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card-elevated p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-xl font-bold">{index + 1}</div>
              <div><h3 className="text-xl font-bold text-white">{milestone.title}</h3><span className="text-gray-400 text-sm">{milestone.days || 7} days</span></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(milestone.tasks || []).map((task, i) => (<span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">{task}</span>))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function RepoStats({ meta }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-wrap justify-center gap-4 mb-6"
    >
      <span className="px-4 py-2 glass rounded-full text-white font-medium">📦 {meta.name}</span>
      <span className="px-4 py-2 glass rounded-full text-yellow-400">⭐ {meta.stars}</span>
      <span className="px-4 py-2 glass rounded-full text-blue-400">🍴 {meta.forks}</span>
      <span className="px-4 py-2 glass rounded-full text-green-400">📁 {meta.file_count} files</span>
      {meta.language && <span className="px-4 py-2 glass rounded-full text-purple-400">{meta.language}</span>}
    </motion.div>
  )
}

const easeCard = { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
const easePage = { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 120 : -120, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -120 : 120, opacity: 0 }),
}

export default function StoryPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState('story')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slideDir, setSlideDir] = useState(1)
  const [repoUrl, setRepoUrl] = useState('')

  useEffect(() => {
    const storedUrl = localStorage.getItem('codestory_url')
    if (!storedUrl) { navigate('/'); return }
    setRepoUrl(storedUrl)
  }, [navigate])

  const fetchStory = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ github_url: repoUrl })
      })
      if (!response.ok) throw new Error('Failed to analyze repo')
      const raw = await response.json()
      if (raw.success) setData({ meta: raw.repo_meta, analysis: raw.analysis })
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (repoUrl) fetchStory()
  }, [repoUrl])

  const nextSlide = useCallback(() => {
    const slides = data?.analysis?.story_slides || []
    if (currentSlide < slides.length - 1) { setSlideDir(1); setCurrentSlide(s => s + 1) }
    if (currentSlide === slides.length - 1) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
  }, [currentSlide, data])

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) { setSlideDir(-1); setCurrentSlide(s => s - 1) }
  }, [currentSlide])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentTab !== 'story') return
      if (e.key === 'ArrowRight') nextSlide()
      if (e.key === 'ArrowLeft') prevSlide()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentTab, nextSlide, prevSlide])

  useEffect(() => {
    if (currentTab !== 'story' || !data) return;
    const timer = setTimeout(() => nextSlide(), 6000);
    return () => clearTimeout(timer);
  }, [currentTab, currentSlide, data, nextSlide]);

  if (loading) return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-deep)' }}>
      <MatrixBackground />
      <AmbientGlow />
      <GridBackground />
      <Navbar />
      <TerminalLoading repoName={repoUrl.split('/').pop()} />
    </div>
  )

  if (!data) return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-deep)' }}>
      <MatrixBackground />
      <AmbientGlow />
      <GridBackground />
      <Navbar />
      <div className="pt-32 text-center relative" style={{ zIndex: 20 }}><p className="text-red-400">Failed to load. Please try again.</p></div>
    </div>
  )

  const { meta, analysis } = data
  const slides = analysis?.story_slides || []
  const totalSlides = Math.max(slides.length, 7)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-deep)' }}>
      <MatrixBackground />
      <AmbientGlow />
      <GridBackground />
      <Navbar />
      <div className="pt-24 pb-8 px-4 relative" style={{ zIndex: 20 }}>
        <div className="max-w-6xl mx-auto">
          <RepoStats meta={meta} />
          
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.12, ease: [0.34, 1.56, 0.64, 1] }}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  currentTab === tab.id
                    ? 'bg-gradient-primary text-white shadow-lg shadow-primary-purple/25'
                    : 'glass text-gray-400 hover:text-white'
                }`}
                style={{ transitionDuration: '150ms', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                {tab.icon} {tab.label}
              </motion.button>
            ))}
          </motion.div>
          
          <AnimatePresence mode="wait">
            {currentTab === 'story' && (
              <motion.div key="story" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={easeCard}>
                <div className="mb-6">
                  <div className="flex gap-2 justify-center">
                    {Array.from({ length: totalSlides }).map((_, i) => (
                      <motion.button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-gradient-primary' : 'w-2 bg-gray-700'}`} whileHover={{ scale: 1.2 }} />
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <AnimatePresence mode="wait" custom={slideDir}>
                    <motion.div
                      key={currentSlide}
                      custom={slideDir}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={easePage}
                    >
                      <StorySlide slide={slides[currentSlide] || {}} meta={meta} />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="flex justify-between items-center mt-8">
                  <motion.button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.12, ease: [0.34, 1.56, 0.64, 1] }}
                    className="px-6 py-3 rounded-xl glass-card disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Previous
                  </motion.button>
                  <span className="text-gray-400 font-mono">{currentSlide + 1} / {totalSlides}</span>
                  <motion.button
                    onClick={nextSlide}
                    disabled={currentSlide === totalSlides - 1}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.12, ease: [0.34, 1.56, 0.64, 1] }}
                    className="px-6 py-3 rounded-xl bg-gradient-primary disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                  </motion.button>
                </div>
              </motion.div>
            )}
            {currentTab === 'improvements' && <motion.div key="improvements" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={easeCard}><ImprovementsTab improvements={analysis?.improvements || []} /></motion.div>}
            {currentTab === 'guide' && <motion.div key="guide" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={easeCard}><BuildGuideTab guide={analysis?.build_guide || {}} /></motion.div>}
            {currentTab === 'resources' && <motion.div key="resources" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={easeCard}><ResourcesTab resources={analysis?.resources || {}} /></motion.div>}
            {currentTab === 'roadmap' && <motion.div key="roadmap" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={easeCard}><RoadmapTab roadmap={analysis?.roadmap || {}} /></motion.div>}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}