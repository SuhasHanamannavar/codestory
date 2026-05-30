import { motion } from 'framer-motion'
import { riskBand, riskLabel } from '../lib/colorTokens'

export default function RiskBadge({ score01 }) {
  const band = riskBand(score01)
  const label = riskLabel(score01)
  const styles = {
    low: 'bg-green-500/10 border-green-500/30 text-green-300',
    medium: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    high: 'bg-red-500/10 border-red-500/30 text-red-300'
  }

  return (
    <motion.span
      key={label}
      initial={{ scale: 0.85 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-mono border ${styles[band]}`}
    >
      {label}
    </motion.span>
  )
}
