import { motion } from 'framer-motion'
import RiskBadge from './RiskBadge'
import { riskLabel } from '../lib/colorTokens'

function clamp01(n) {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(1, n))
}

function scoreToPct(score01) {
  return Math.round(clamp01(score01) * 100)
}

export default function RiskSummaryPanel({ title = 'Risk Summary', graph, deltas }) {
  const nodes = graph?.nodes || []
  const avg = nodes.length
    ? nodes.reduce((sum, n) => sum + clamp01(n.risk_score ?? n.risk), 0) / nodes.length
    : 0

  const top = [...nodes]
    .sort((a, b) => clamp01(b.risk_score ?? b.risk) - clamp01(a.risk_score ?? a.risk))
    .slice(0, 6)

  const byIdDelta = new Map()
  ;(deltas || []).forEach((d) => {
    if (!d?.node_id) return
    byIdDelta.set(d.node_id, d)
  })

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-wide text-gray-200">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-mono">avg</span>
          <RiskBadge score01={avg} />
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Overall risk</span>
          <span className="font-mono">{scoreToPct(avg)}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-gradient-primary" style={{ width: `${scoreToPct(avg)}%` }} />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs text-gray-500 font-mono">Top risk modules</div>
        <div className="mt-2 space-y-2">
          {top.map((n) => {
            const s = clamp01(n.risk_score ?? n.risk)
            const d = byIdDelta.get(n.id)
            const before = d?.risk_before
            const after = d?.risk_after
            const change = Number.isFinite(before) && Number.isFinite(after) ? after - before : null
            const changeLabel = change == null ? '' : `${change >= 0 ? '+' : ''}${Math.round(change * 100)}%`
            const changeTone = change == null ? 'text-gray-500' : change > 0.01 ? 'text-red-300' : change < -0.01 ? 'text-green-300' : 'text-gray-300'

            return (
              <div key={n.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-gray-200 truncate">{n.label || n.id}</div>
                  <div className="text-xs text-gray-500 truncate">{riskLabel(s)} risk</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {changeLabel ? <span className={`text-xs font-mono ${changeTone}`}>{changeLabel}</span> : null}
                  <RiskBadge score01={s} />
                </div>
              </div>
            )
          })}
          {top.length === 0 ? <div className="text-sm text-gray-500">No graph loaded</div> : null}
        </div>
      </div>
    </motion.div>
  )
}
