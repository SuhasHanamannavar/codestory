import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import CodeParticles from '../components/CodeParticles'
import Navbar from '../components/Navbar'
import FeatureCard from '../components/FeatureCard'
import StatsBar from '../components/StatsBar'

const features = [
  { icon: '🔍', title: 'Deep Code Analysis', description: 'Reads README, analyzes file structure & extracts key insights automatically' },
  { icon: '📊', title: 'AI Recommendations', description: 'Get prioritized improvements, build guides & learning resources tailored to your stack' },
  { icon: '🗺️', title: 'Project Roadmap', description: 'Track your project improvements with interactive kanban boards' }
]

export default function LandingPage() {
  const [repoUrl, setRepoUrl] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!repoUrl.trim()) return
    localStorage.setItem('codestory_url', repoUrl)
    navigate('/story')
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <CodeParticles />
      <Navbar />
      <main className="relative z-10 px-4 pt-32 pb-16 mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center flex flex-col items-center">
          <img src="/logo.png" alt="CodeStory Logo" className="w-64 h-64 md:w-80 md:h-80 object-contain mb-8 mix-blend-screen drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
            Your Code Has a Story.{' '}
            <span className="gradient-text">Let AI Tell It.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Paste any GitHub repo → Get a visual story that anyone can understand
          </p>
          <motion.form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 justify-center items-center max-w-3xl mx-auto mb-16" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
            <input type="text" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="github.com/owner/repo" className="w-full md:flex-1 px-6 py-4 rounded-xl text-lg glow-input text-white placeholder-gray-500" />
            <button type="submit" disabled={!repoUrl.trim()} className="w-full md:w-auto px-8 py-4 rounded-xl text-lg font-semibold text-white glow-button disabled:opacity-50 disabled:cursor-not-allowed">
              Generate Story
            </button>
          </motion.form>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}>
          <StatsBar />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }} className="grid md:grid-cols-3 gap-6 mt-20">
          {features.map((feature, index) => (<FeatureCard key={index} {...feature} delay={index * 0.1} />))}
        </motion.div>
      </main>
      <footer className="relative z-10 py-8 text-center text-gray-500">
        <p>© 2026 CodeStory</p>
      </footer>
    </div>
  )
}