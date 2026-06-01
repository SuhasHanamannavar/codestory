import { motion } from 'framer-motion'
import RiskBadge from './RiskBadge'

function clamp01(n) {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(1, n))
}

export default function NodeDetailsPanel({ graph, selectedNodeId }) {
  const nodes = graph?.nodes || []
  const node = selectedNodeId ? nodes.find((n) => String(n.id) === String(selectedNodeId)) : null

  const owners = Array.isArray(node?.owners) ? node.owners : []
  const topOwners = [...owners]
    .filter((o) => o && typeof o.name === 'string')
    .sort((a, b) => (b.share ?? 0) - (a.share ?? 0))
    .slice(0, 6)

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="glass-card-elevated p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-wide text-gray-200">Module Details</h3>
        {node ? <RiskBadge score01={clamp01(node.risk_score ?? node.risk)} /> : null}
      </div>

      {!node ? (
        <div className="mt-3 text-sm text-gray-500">Select a node to inspect ownership and risk drivers.</div>
      ) : (
        <div className="mt-3">
          <div className="text-sm text-white font-semibold truncate">{node.label || node.name || node.id}</div>
          <div className="text-xs text-gray-500 font-mono mt-1">id: {String(node.id)}</div>

          <div className="mt-4">
            <div className="text-xs text-gray-500 font-mono">Top owners</div>
            <div className="mt-2 space-y-2">
              {topOwners.map((o) => (
                <div key={o.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-200 truncate">{o.name}</span>
                  <span className="text-xs font-mono text-gray-400">{Math.round(clamp01(o.share ?? o.ownership ?? 0) * 100)}%</span>
                </div>
              ))}
              {topOwners.length === 0 ? <div className="text-sm text-gray-500">No ownership data</div> : null}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
