import { motion } from 'framer-motion'

function riskColor(score) {
  if (score > 0.6) return 'text-red-400'
  if (score > 0.35) return 'text-yellow-400'
  return 'text-green-400'
}

function riskBg(score) {
  if (score > 0.6) return 'bg-red-500/10 border-red-500/30'
  if (score > 0.35) return 'bg-yellow-500/10 border-yellow-500/30'
  return 'bg-green-500/10 border-green-500/30'
}

export default function ImpactSummary({ impactMap = {}, metrics = {} }) {
  const modules = impactMap.high_risk_modules || []
  const cascade = impactMap.cascade_impact || []

  if (!modules.length && !cascade.length && !Object.keys(metrics).length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-elevated p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-wide text-gray-200">Impact Assessment</h3>
        {impactMap.overall_impact_summary && (
          <span className="text-xs text-gray-500 font-mono truncate max-w-[200px] text-right">
            {impactMap.overall_impact_summary}
          </span>
        )}
      </div>

      {Object.keys(metrics).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Modules', key: 'total_modules', color: 'text-blue-400' },
            { label: 'Avg Risk', key: 'avg_risk', color: riskColor(metrics.avg_risk), fmt: (v) => `${Math.round(v * 100)}%` },
            { label: 'High Risk', key: 'high_risk_modules', color: 'text-red-400' },
            { label: 'Single Owner', key: 'single_owner_modules', color: 'text-yellow-400' },
          ].map((m) => (
            <div key={m.key} className="glass rounded-xl p-3 text-center">
              <div className={`text-xl font-bold ${m.color}`}>{m.fmt ? m.fmt(metrics[m.key]) : metrics[m.key] ?? '-'}</div>
              <div className="text-xs text-gray-500 mt-1">{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {modules.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 font-mono mb-2">High Risk Modules</div>
          <div className="space-y-2">
            {modules.map((m, i) => (
              <motion.div
                key={m.module}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={`glass rounded-xl p-3 border ${riskBg(m.risk_score)}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white truncate">{m.module}</span>
                  <span className={`text-xs font-mono font-bold ${riskColor(m.risk_score)}`}>
                    {Math.round((m.risk_score || 0) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500 truncate">{m.reason || ''}</span>
                  <span className="text-xs text-gray-500 shrink-0 ml-2">
                    loss: {m.knowledge_loss_percent || 0}%
                  </span>
                </div>
                {m.suggested_shadow_owners?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.suggested_shadow_owners.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full bg-primary-purple/10 border border-primary-purple/20 text-primary-purpleLight text-[10px] font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {cascade.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 font-mono mb-2">Cascade Risk</div>
          <div className="space-y-1.5">
            {cascade.slice(0, 5).map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                <span className="text-red-400">{c.source_module}</span>
                <span className="text-gray-600">→</span>
                <span className="text-yellow-400">{c.affected_module}</span>
                <span className="text-gray-600 ml-auto">{Math.round((c.propagation_risk || 0) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}