import { motion } from 'framer-motion'

const STEPS = [
  {
    number: '01',
    title: 'Analyze',
    emoji: '🔍',
    color: 'from-purple-500 to-blue-500',
    items: [
      'Paste any public GitHub URL',
      'System fetches commits, PRs, reviews',
      'Builds a knowledge graph of modules & owners',
      'Multi-signal risk scores computed',
    ],
  },
  {
    number: '02',
    title: 'Simulate',
    emoji: '⚡',
    color: 'from-blue-500 to-cyan-500',
    items: [
      'Type a developer name',
      'Watch the graph animate — risk propagates',
      'Ownership redistributes automatically',
      'Cascade risk through dependency chains',
    ],
  },
  {
    number: '03',
    title: 'Rescue',
    emoji: '🛡️',
    color: 'from-cyan-500 to-teal-500',
    items: [
      '30-day knowledge transfer timeline',
      'Technical handover playbook generated',
      'Client-facing transition summary',
      'One-click save to Notion',
    ],
  },
]

export default function HowItWorks() {
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
            How it <span className="gradient-text">works</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Three steps. No account needed. Results in seconds.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {idx < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-12 -right-4 text-primary-purple/30 text-2xl z-10">
                  <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
                    <path d="M4 12h20M20 8l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}

              <div className="glass-card-elevated p-6 h-full">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-lg mb-4 elevation-sm`}>
                  {step.emoji}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-mono text-primary-purple">{step.number}</span>
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                </div>

                <ul className="space-y-2">
                  {step.items.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.25, delay: idx * 0.1 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-start gap-2 text-sm text-gray-400"
                    >
                      <span className="text-primary-purple mt-0.5 shrink-0">•</span>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
