import { useState } from 'react'
import { motion } from 'framer-motion'

const springTap = { type: 'spring', stiffness: 500, damping: 30 }

export default function ResignationForm({ loading = false, onTrigger }) {
  const [devName, setDevName] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const name = devName.trim()
    if (!name) return
    onTrigger?.(name)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="glass-card rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-gray-200">Resignation Simulation</h3>
          <p className="text-xs text-gray-500 mt-1">Remove a developer and watch risk propagate</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-3 flex flex-col gap-3">
        <input
          value={devName}
          onChange={(e) => setDevName(e.target.value)}
          placeholder="Developer name (e.g., alice)"
          className="w-full px-4 py-3 rounded-xl text-sm glow-input text-white placeholder-gray-500"
        />
        <motion.button
          type="submit"
          disabled={loading || !devName.trim()}
          whileHover={!loading && devName.trim() ? { scale: 1.03 } : {}}
          whileTap={!loading && devName.trim() ? { scale: 0.97 } : {}}
          transition={springTap}
          className="px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Trigger Resignation
        </motion.button>
      </form>
    </motion.div>
  )
}
