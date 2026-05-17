import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import Navbar from '../components/Navbar'
import MatrixBackground from '../components/MatrixBackground'
import TerminalLoading from '../components/TerminalLoading'

const storyTypes = [
  { id: 'technical', label: 'Technical', icon: '⚙️', description: 'Architecture, tech stack, and code insights' },
  { id: 'investor', label: 'Investor', icon: '💰', description: 'Market pain, traction, and growth potential' },
  { id: 'developer', label: 'Developer', icon: '👨‍💻', description: 'What it is, why built, and how to contribute' }
]

const tabs = [
  { id: 'story', label: 'Story' },
  { id: 'improvements', label: 'Improvements' },
  { id: 'guide', label: 'Guide' },
  { id: 'resources', label: 'Resources' },
  { id: 'roadmap', label: 'Roadmap' }
]

function StorySlide({ slide, meta }) {
  const content = slide.content || ''
  const isList = content.includes('\n') && (content.includes('•') || content.includes('-') || content.includes('*'))
  const items = isList ? content.split('\n').filter(line => line.trim()) : []
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-2xl p-8 max-w-4xl mx-auto"
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
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
      
      {slide.title?.toLowerCase().includes('impact') && (
        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <span className="px-4 py-2 bg-primary-purple/20 rounded-full text-primary-purpleLight border border-primary-purple/30">{meta.language || 'Code'}</span>
          <span className="px-4 py-2 bg-yellow-500/20 rounded-full text-yellow-400 border border-yellow-500/30">⭐ {meta.stars} stars</span>
          <span className="px-4 py-2 bg-blue-500/20 rounded-full text-blue-400 border border-blue-500/30">🍴 {meta.forks} forks</span>
        </div>
      )}
    </motion.div>
  )
}

function ImprovementsTab({ improvements = [] }) {
  const priorityColors = { High: 'bg-red-500/20 text-red-400 border-red-500/50', Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', Low: 'bg-green-500/20 text-green-400 border-green-500/50' }
  
  if (!improvements.length) return <div className="text-center py-12 text-gray-400"><p className="text-xl">No improvements available</p></div>
  
  const highPriority = improvements.filter(i => i.priority === 'High')
  const mediumPriority = improvements.filter(i => i.priority === 'Medium')
  const lowPriority = improvements.filter(i => i.priority === 'Low')
  
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-2">AI Improvement Suggestions</h2>
        <p className="text-gray-400">Prioritized by impact and effort</p>
      </motion.div>
      
      {highPriority.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">🔴 High Priority</h3>
          <div className="grid gap-4 mb-6">
            {highPriority.map((item, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.02 }} className="glass-card rounded-xl p-6 border border-red-500/30">
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
              <motion.div key={index} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.02 }} className="glass-card rounded-xl p-6 border border-yellow-500/30">
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
              <motion.div key={index} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.02 }} className="glass-card rounded-xl p-6 border border-green-500/30">
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
  if (!steps.length) return <div className="text-center py-12 text-gray-400"><p className="text-xl">No build guide available</p></div>
  
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-2">🛠️ Build Guide</h2>
      </motion.div>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.15 }} className="glass-card rounded-xl overflow-hidden">
            <div className="flex items-stretch">
              <div className="w-16 bg-gradient-primary flex items-center justify-center text-2xl font-bold">{step.step || index + 1}</div>
              <div className="flex-1 p-6">
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 mb-4">{step.description}</p>
                {(step.command || step.code) && (
                  <div className="bg-dark-bg rounded-lg p-4 border border-dark-border overflow-x-auto">
                    <pre className="text-sm text-primary-purpleLight font-mono">{step.command || step.code}</pre>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ResourcesTab({ resources = {} }) {
  const docs = resources.documentation || []
  const tutorials = resources.tutorials || []
  const hasContent = docs.length > 0 || tutorials.length > 0
  if (!hasContent) return <div className="text-center py-12 text-gray-400"><p className="text-xl">No resources available</p></div>
  
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-2">📚 Resources</h2>
      </motion.div>
      {docs.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">📖 Documentation</h3>
          <div className="grid gap-3">
            {docs.map((doc, i) => (
              <motion.a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.02 }} className="glass-card rounded-xl p-4 flex items-center gap-4">
                <div className="text-2xl">📄</div>
                <div className="flex-1"><h4 className="text-white font-bold">{doc.title}</h4><p className="text-gray-400 text-sm">{doc.description}</p></div>
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
  if (!milestones.length) return <div className="text-center py-12 text-gray-400"><p className="text-xl">No roadmap available</p></div>
  
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-2">🗺️ Roadmap</h2>
      </motion.div>
      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <motion.div key={index} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.15 }} className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-xl font-bold">{index + 1}</div>
              <div><h3 className="text-xl font-bold text-white">{milestone.title}</h3><span className="text-gray-400 text-sm">{milestone.days} days</span></div>
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

export default function StoryPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState('story')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [repoUrl, setRepoUrl] = useState('')
  const [storyType, setStoryType] = useState('technical')

  useEffect(() => {
    const storedUrl = localStorage.getItem('codestory_url')
    if (!storedUrl) { navigate('/'); return }
    setRepoUrl(storedUrl)
  }, [navigate])

  const fetchStory = async () => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ github_url: repoUrl, story_type: storyType })
      })
      if (!response.ok) throw new Error('Failed')
      const raw = await response.json()
      if (raw.success) setData({ meta: raw.repo_meta, analysis: raw.analysis })
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (repoUrl) setTimeout(fetchStory, 3000)
  }, [repoUrl])

  useEffect(() => {
    setCurrentSlide(0)
  }, [storyType])

  const nextSlide = useCallback(() => {
    const slides = data?.analysis?.story_slides || []
    if (currentSlide < slides.length - 1) setCurrentSlide(s => s + 1)
    if (currentSlide === slides.length - 1) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
  }, [currentSlide, data])

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) setCurrentSlide(s => s - 1)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentTab !== 'story') return
      if (e.key === 'ArrowRight') nextSlide()
      if (e.key === 'ArrowLeft') prevSlide()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentTab, nextSlide, prevSlide])

  if (loading) return (
    <div className="min-h-screen bg-dark-bg">
      <MatrixBackground />
      <Navbar />
      <TerminalLoading repoName={repoUrl.split('/').pop()} />
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-dark-bg">
      <MatrixBackground />
      <Navbar />
      <div className="pt-32 text-center"><p className="text-red-400">Failed to load</p></div>
    </div>
  )

  const { meta, analysis } = data
  const slides = analysis?.story_slides || []
  const totalSlides = Math.max(slides.length, 7)

  return (
    <div className="min-h-screen bg-dark-bg">
      <MatrixBackground />
      <Navbar />
      <div className="pt-24 pb-8 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map((tab) => (
              <motion.button key={tab.id} onClick={() => setCurrentTab(tab.id)} className={`px-4 py-2 rounded-xl font-medium transition-all ${currentTab === tab.id ? 'bg-gradient-primary text-white' : 'glass text-gray-400 hover:text-white'}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {tab.icon} {tab.label}
              </motion.button>
            ))}
          </motion.div>
          <AnimatePresence mode="wait">
            {currentTab === 'story' && (
              <motion.div key="story" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="flex justify-center gap-3 mb-8">
                  {storyTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      onClick={() => setStoryType(type.id)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        storyType === type.id 
                          ? 'bg-gradient-primary text-white' 
                          : 'glass text-gray-400 hover:text-white'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="mr-2">{type.icon}</span>
                      {type.label}
                    </motion.button>
                  ))}
                </div>
                <div className="mb-6">
                  <div className="flex gap-2 justify-center">
                    {Array.from({ length: totalSlides }).map((_, i) => (
                      <motion.button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-gradient-primary' : 'w-2 bg-gray-700'}`} whileHover={{ scale: 1.2 }} />
                    ))}
                  </div>
                </div>
                <div className="relative min-h-[500px]">
                  <AnimatePresence mode="wait">
                    <motion.div key={currentSlide} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.4 }} className="absolute inset-0">
                      <StorySlide slide={slides[currentSlide] || {}} meta={meta} />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="flex justify-between items-center mt-8">
                  <motion.button onClick={prevSlide} disabled={currentSlide === 0} className="px-6 py-3 rounded-xl glass-card disabled:opacity-30" whileHover={{ scale: 1.05 }}>Previous</motion.button>
                  <span className="text-gray-400 font-mono">{currentSlide + 1} / {totalSlides}</span>
                  <motion.button onClick={nextSlide} disabled={currentSlide === totalSlides - 1} className="px-6 py-3 rounded-xl bg-gradient-primary disabled:opacity-30" whileHover={{ scale: 1.05 }}>Next</motion.button>
                </div>
              </motion.div>
            )}
            {currentTab === 'improvements' && <motion.div key="improvements" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><ImprovementsTab improvements={analysis?.improvements || []} /></motion.div>}
            {currentTab === 'guide' && <motion.div key="guide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><BuildGuideTab guide={analysis?.build_guide || {}} /></motion.div>}
            {currentTab === 'resources' && <motion.div key="resources" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><ResourcesTab resources={analysis?.resources || {}} /></motion.div>}
            {currentTab === 'roadmap' && <motion.div key="roadmap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><RoadmapTab roadmap={analysis?.roadmap || {}} /></motion.div>}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}