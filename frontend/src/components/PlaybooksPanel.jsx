import { motion } from 'framer-motion'

function Section({ title, content }) {
  const text = (content || '').trim()

  return (
    <div className="glass-card rounded-2xl p-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-gray-200">{title}</h3>
        <motion.button
          type="button"
          onClick={() => {
            if (!text) return
            navigator.clipboard?.writeText(text)
          }}
          whileHover={text ? { scale: 1.05 } : {}}
          whileTap={text ? { scale: 0.95 } : {}}
          transition={{ duration: 0.12, ease: [0.34, 1.56, 0.64, 1] }}
          className="text-xs font-mono text-gray-400 hover:text-white transition-colors"
          disabled={!text}
          title={text ? 'Copy to clipboard' : 'No content'}
        >
          Copy
        </motion.button>
      </div>
      <div className="mt-3 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
        {text || <span className="text-gray-500">Playbook will appear after simulation</span>}
      </div>
    </div>
  )
}

export default function PlaybooksPanel({ playbooks }) {
  const tech = playbooks?.technical || playbooks?.tech || ''
  const client = playbooks?.client || ''

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="grid md:grid-cols-2 gap-4">
      <Section title="Technical Playbook" content={tech} />
      <Section title="Client Playbook" content={client} />
    </motion.div>
  )
}
