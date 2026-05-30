import { motion } from 'framer-motion'

export default function TurnoverHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto mb-8 relative overflow-hidden"
    >
      <div className="text-5xl mb-4">🛡️</div>

      <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight gradient-text">
        From Code to Insights
      </h1>

      <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
        Paste any GitHub repository and get AI-powered story, improvements, build guide, resources, roadmap, risk graph, and turnover rescue plans.
      </p>
    </motion.div>
  )
}
