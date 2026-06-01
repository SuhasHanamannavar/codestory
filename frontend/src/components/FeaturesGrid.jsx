import { motion } from 'framer-motion'

const FEATURES = [
  {
    icon: '🧠',
    title: 'Knowledge Graph',
    description: 'Interactive Cytoscape.js visualization of code modules and their owners. Each node shows ownership rings, risk scores, and dependency edges.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: '📊',
    title: 'Multi-Signal Risk Scoring',
    description: '4-signal weighted ensemble: commit concentration, review exclusivity, recency, and file complexity. Computed from real GitHub data.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: '🔄',
    title: 'Cascade Analysis',
    description: 'See how risk propagates through your dependency chain when a developer leaves. Automatic redistribution of ownership across remaining team.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: '📋',
    title: 'Rescue Playbooks',
    description: 'AI-generated 30-day transfer schedule, technical handover document, and client-facing transition summary. Export to Notion in one click.',
    gradient: 'from-green-500 to-emerald-500',
  },
]

export default function FeaturesGrid() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
            Built for <span className="gradient-text">engineering teams</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Every feature is designed to answer one question: what happens when someone leaves?
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card-elevated p-6 flex gap-5"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl shrink-0 elevation-xs`}>
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
