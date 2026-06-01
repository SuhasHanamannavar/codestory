import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import AmbientGlow from '../components/AmbientGlow'
import GridBackground from '../components/GridBackground'

const easeCard = { duration: 0.35, ease: [0.16, 1, 0.3, 1] }

const features = [
  { title: 'Universal Repository Support', description: 'Analyzes any public GitHub repository regardless of language or framework' },
  { title: 'Deep Code Reading', description: 'Fetches README, language breakdown, file tree, and reads top code files' },
  { title: 'AI-Powered Analysis', description: 'Uses Groq AI to generate meaningful insights from your codebase' },
  { title: 'Visual Storytelling', description: 'Transforms complex code into 7 beautiful animated slides anyone can understand' },
  { title: 'Smart Recommendations', description: 'Provides prioritized improvements based on actual code analysis' },
  { title: 'Project Roadmap', description: 'Creates actionable kanban-style roadmaps for project improvements' }
]

const techStack = ['React', 'Tailwind CSS', 'Framer Motion', 'FastAPI', 'Groq AI', 'GitHub API', 'httpx', 'Python']

export default function DocumentationPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-deep)' }}>
      <AmbientGlow />
      <GridBackground />
      <Navbar />
      <main className="pt-32 pb-16 px-4 relative" style={{ zIndex: 20 }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ...easeCard }} className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"><span className="gradient-text">Documentation</span></h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">Everything you need to know about CodeStory</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ...easeCard }} className="glass-card rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ...easeCard }} className="glass-card rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Technology Stack</h2>
            <div className="flex flex-wrap gap-3">
              {techStack.map((tech, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 + index * 0.04, duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                  className="px-4 py-2 rounded-full bg-dark-bg border border-dark-border text-gray-300 font-mono text-sm"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, ...easeCard }} className="glass-card rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">API Endpoints</h2>
            <div className="space-y-4">
              <div className="bg-dark-bg rounded-lg p-4">
                <span className="text-primary-purple font-mono text-sm">POST /api/analyze</span>
                <p className="text-gray-400 text-sm mt-2">Analyze a GitHub repository</p>
              </div>
              <div className="bg-dark-bg rounded-lg p-4">
                <span className="text-primary-purple font-mono text-sm">GET /api/health</span>
                <p className="text-gray-400 text-sm mt-2">Check API health status</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}