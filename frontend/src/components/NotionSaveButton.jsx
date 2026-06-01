import { useState } from 'react'
import { motion } from 'framer-motion'

export default function NotionSaveButton({
  disabled = false,
  onSave
}) {
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handle = async () => {
    if (disabled || saving) return
    setSaving(true)
    setError(null)
    try {
      const res = await onSave?.()
      setResult(res || { ok: true })
    } catch (e) {
      setError(e?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const url = result?.notion_page_url || result?.url

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="glass-card-elevated p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-gray-200">Notion</h3>
          <p className="text-xs text-gray-500 mt-1">Create a formatted rescue plan page</p>
        </div>
        <motion.button
          type="button"
          onClick={handle}
          disabled={disabled || saving}
          whileHover={!disabled && !saving ? { scale: 1.03 } : {}}
          whileTap={!disabled && !saving ? { scale: 0.97 } : {}}
          transition={{ duration: 0.12, ease: [0.34, 1.56, 0.64, 1] }}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save to Notion'}
        </motion.button>
      </div>
      {error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}
      {url ? (
        <a className="mt-3 inline-block text-sm text-primary-purpleLight hover:text-white transition-colors" href={url} target="_blank" rel="noreferrer">
          Open Notion Page →
        </a>
      ) : null}
    </motion.div>
  )
}
