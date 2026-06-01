import { motion } from 'framer-motion'

const NODES = [
  { id: 'ui', label: 'UI', x: 50, y: 15, risk: 0.18, owners: ['alice', 'cara'] },
  { id: 'api', label: 'API', x: 20, y: 45, risk: 0.22, owners: ['alice', 'bob'] },
  { id: 'auth', label: 'Auth', x: 80, y: 45, risk: 0.33, owners: ['dave', 'alice'] },
  { id: 'db', label: 'DB', x: 35, y: 75, risk: 0.28, owners: ['bob', 'alice'] },
  { id: 'bill', label: 'Billing', x: 65, y: 75, risk: 0.41, owners: ['cara', 'bob'] },
]

const EDGES = [
  ['ui', 'api'], ['api', 'auth'], ['api', 'db'], ['api', 'bill'],
]

function riskColor(s) {
  if (s >= 0.34) return s >= 0.67 ? '#ef4444' : '#f59e0b'
  return '#22c55e'
}

function riskGlow(s) {
  if (s >= 0.34) return s >= 0.67 ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'
  return 'rgba(34,197,94,0.3)'
}

export default function LandingHero({ onAnalyze }) {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-subtle rounded-full text-sm text-primary-purpleLight mb-6">
              <span className="w-2 h-2 rounded-full bg-primary-purple animate-pulse-glow" />
              Bus Factor Intelligence
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 tracking-tight">
              Know who owns what.
              <br />
              <span className="gradient-text">Before they leave.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-lg mb-8 font-light leading-relaxed">
              Paste any public GitHub repository. TurnoverGuard maps developer ownership,
              simulates resignations, and generates AI-powered rescue plans — in seconds.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const input = e.target.querySelector('input')
                if (input?.value?.trim()) onAnalyze?.(input.value.trim())
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                placeholder="https://github.com/owner/repo"
                className="flex-1 px-5 py-4 rounded-xl text-base glow-input text-white placeholder-gray-500"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-primary elevation-glow whitespace-nowrap"
              >
                Analyze Risk →
              </motion.button>
            </form>

            <div className="flex items-center gap-4 mt-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">✓ No signup</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span className="flex items-center gap-1">✓ Public repos</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span className="flex items-center gap-1">✓ Free</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-[500px] aspect-square">
              {EDGES.map(([s, t], i) => {
                const src = NODES.find(n => n.id === s)
                const tgt = NODES.find(n => n.id === t)
                if (!src || !tgt) return null
                return (
                  <svg key={i} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                    <line
                      x1={`${src.x}%`} y1={`${src.y}%`}
                      x2={`${tgt.x}%`} y2={`${tgt.y}%`}
                      stroke="rgba(124,58,237,0.15)"
                      strokeWidth="2"
                    />
                  </svg>
                )
              })}
              {NODES.map((node, i) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2,
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-xs font-bold text-white mb-1"
                    style={{
                      backgroundColor: 'rgba(18,18,26,0.95)',
                      border: `2px solid ${riskColor(node.risk)}`,
                      boxShadow: `0 0 20px ${riskGlow(node.risk)}, var(--elevation-md)`,
                    }}
                  >
                    {node.label}
                  </div>
                  <div
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: riskColor(node.risk) + '20',
                      color: riskColor(node.risk),
                      border: `1px solid ${riskColor(node.risk)}40`,
                    }}
                  >
                    {Math.round(node.risk * 100)}%
                  </div>
                </motion.div>
              ))}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.06) 0%, transparent 70%)',
                  zIndex: 0,
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
