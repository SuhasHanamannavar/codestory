import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <main className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About <span className="gradient-text">CodeStory</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              We believe every piece of code has a story to tell. Our mission is to make software development accessible to everyone through AI-powered visual storytelling.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="glass-card rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary-purpleLight">Our Vision</h2>
            <p className="text-gray-300 leading-relaxed">
              CodeStory was born from a simple idea: what if we could take any codebase and turn it into something anyone could understand? Whether you're a founder pitching to investors, a developer showcasing your work, or a team lead explaining a project to stakeholders, we make it effortless.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }} className="text-center">
            <h2 className="text-2xl font-bold mb-6">Technology Stack</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {['React', 'Tailwind CSS', 'Framer Motion', 'FastAPI', 'Groq AI', 'GitHub API'].map((tech, index) => (
                <span key={index} className="px-4 py-2 rounded-full bg-dark-card border border-dark-border text-gray-300 font-mono text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}