import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const phaseColors = {
  'Immediate Crisis': { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-300', dot: 'bg-red-500' },
  'Deep Transfer': { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300', dot: 'bg-blue-500' },
  'Shadow Handover': { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-300', dot: 'bg-yellow-500' },
  'Validation': { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-300', dot: 'bg-green-500' },
}

export default function RescueTimeline({ schedule = [] }) {
  const [expandedDay, setExpandedDay] = useState(null)

  const grouped = useMemo(() => {
    const map = {}
    for (const item of schedule) {
      const p = item.phase || 'Unknown'
      if (!map[p]) map[p] = []
      map[p].push(item)
    }
    return Object.entries(map)
  }, [schedule])

  if (!schedule.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold tracking-wide text-gray-200">30-Day Transfer Timeline</h3>
        <span className="text-xs font-mono text-gray-500">{schedule.length} days</span>
      </div>

      <div className="space-y-6">
        {grouped.map(([phase, items], pi) => {
          const colors = phaseColors[phase] || phaseColors['Validation']
          return (
            <div key={phase}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>{phase}</span>
                <span className="text-xs text-gray-600 font-mono">Day {items[0].day}–{items[items.length - 1].day}</span>
              </div>
              <div className="relative ml-2">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-800 rounded-full" />
                <div className="space-y-2">
                  {items.map((day, di) => (
                    <div key={day.day} className="relative pl-8">
                      <div className={`absolute left-0 top-2 w-[14px] h-[14px] rounded-full border-2 border-gray-700 ${colors.dot} ${expandedDay === day.day ? 'ring-2 ring-primary-purple/40' : ''}`} />
                      <motion.button
                        onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full text-left glass rounded-xl p-3 border ${colors.border} transition-all cursor-pointer`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-gray-500 shrink-0 mr-3">Day {day.day}</span>
                          <span className="text-sm text-white font-medium truncate">{day.focus || phase}</span>
                          <span className="text-xs text-gray-600 shrink-0 ml-3">{day.duration_hours || 4}h</span>
                        </div>
                        <AnimatePresence>
                          {expandedDay === day.day && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden"
                            >
                              <ul className="mt-2 space-y-1 border-t border-gray-800 pt-2">
                                {(day.activities || []).slice(0, 4).map((act, ai) => (
                                  <li key={ai} className="flex items-start gap-2 text-xs text-gray-400">
                                    <span className="text-primary-purple mt-0.5">•</span>
                                    {act}
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}