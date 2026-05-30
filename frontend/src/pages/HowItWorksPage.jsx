import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

const easeCard = { duration: 0.35, ease: [0.16, 1, 0.3, 1] }

const steps = [
  { number: '01', title: 'Paste GitHub URL', description: 'Enter any public GitHub repository URL in the input field on our landing page' },
  { number: '02', title: 'AI Analysis', description: 'Our system fetches README, analyzes file structure, reads code content, and identifies the tech stack' },
  { number: '03', title: 'Visual Story Generation', description: 'Groq AI processes all the data and creates 7 beautiful animated slides with insights' },
  { number: '04', title: 'Explore Insights', description: 'View improvements, build guides, resources, and project roadmap - all tailored to your code' }
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <main className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ...easeCard }} className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">How <span className="gradient-text">CodeStory</span> Works</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">From pasting a URL to getting insights — here's the complete journey</p>
          </motion.div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.12, ...easeCard }}
                whileHover={{ x: 4 }}
                className="glass-card rounded-2xl p-8"
              >
                <div className="text-primary-purpleLight text-sm font-mono mb-2">{step.number}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, ...easeCard }}
            className="mt-16 text-center"
          >
            <div className="glass rounded-2xl p-8 inline-block">
              <h3 className="text-xl font-bold text-white mb-4">Ready to try?</h3>
              <p className="text-gray-400 mb-6">Paste any GitHub repo and see the magic</p>
              <motion.a
                href="/"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.12, ease: [0.34, 1.56, 0.64, 1] }}
                className="inline-block px-8 py-3 bg-gradient-primary rounded-xl text-white font-medium"
              >
                Get Started
              </motion.a>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}