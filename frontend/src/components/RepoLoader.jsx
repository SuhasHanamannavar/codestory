import { useState } from 'react'
import { motion } from 'framer-motion'
import StatusChip from './StatusChip'

export default function RepoLoader({
  initialUrl = '',
  loading = false,
  onLoad
}) {
  const [repoUrl, setRepoUrl] = useState(initialUrl)

  const handleSubmit = (e) => {
    e.preventDefault()
    const url = repoUrl.trim()
    if (!url) return
    onLoad?.(url)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-sm text-gray-300 font-semibold tracking-wide">Repository</span>
            <span className="text-xs text-gray-500">Paste a public GitHub repo URL</span>
          </div>
        </div>
        <StatusChip tone="accent" label={loading ? 'loading' : 'ready'} />
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col md:flex-row gap-3">
        <input
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/owner/repo"
          className="flex-1 px-4 py-3 rounded-xl text-sm glow-input text-white placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={loading || !repoUrl.trim()}
          className="px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Load Repository
        </button>
      </form>
    </motion.div>
  )
}
