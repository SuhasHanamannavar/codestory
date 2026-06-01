import { motion } from 'framer-motion'

const agents = [
  {
    id: 'impact',
    name: 'Impact Mapper',
    emoji: '🎯',
    color: 'from-red-500 to-orange-500',
    border: 'border-red-500/30',
    desc: 'Identifies high-risk modules & shadow successors'
  },
  {
    id: 'scheduler',
    name: 'Transfer Scheduler',
    emoji: '📅',
    color: 'from-blue-500 to-cyan-500',
    border: 'border-blue-500/30',
    desc: 'Creates optimized day-by-day 30-day plan'
  },
  {
    id: 'writer',
    name: 'Playbook Writer',
    emoji: '📝',
    color: 'from-purple-500 to-pink-500',
    border: 'border-purple-500/30',
    desc: 'Generates technical + client playbooks'
  }
]

const arrow = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1 }
}

export default function TurnoverAgentPipeline({ active = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-elevated p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold tracking-wide text-gray-200">Multi-Agent Pipeline</h3>
        <div className={`text-xs font-mono px-2 py-0.5 rounded-full ${active ? 'text-green-400 bg-green-500/10 border border-green-500/30 elevation-xs' : 'text-gray-500'}`}>
          {active ? 'running' : 'idle'}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
        {agents.map((agent, idx) => (
          <div key={agent.id} className="flex items-center gap-2 w-full md:w-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
               className={`flex-1 md:flex-none glass rounded-xl p-4 border ${agent.border} ${active ? 'elevation-glow' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center text-lg`}>
                  {agent.emoji}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{agent.name}</div>
                  <div className="text-xs text-gray-500">{agent.desc}</div>
                </div>
              </div>
            </motion.div>

            {idx < agents.length - 1 && (
              <div className="hidden md:flex items-center">
                <motion.svg
                  width="32"
                  height="24"
                  viewBox="0 0 32 24"
                  initial="hidden"
                  animate={active ? "visible" : "hidden"}
                  variants={arrow}
                  transition={{ delay: 0.3 + idx * 0.15, duration: 0.4 }}
                >
                  <path d="M4 12h20M20 8l4 4-4 4" stroke="#7c3aed" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}