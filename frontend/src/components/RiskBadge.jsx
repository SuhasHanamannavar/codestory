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
    <span className={`px-2.5 py-1 rounded-full text-xs font-mono border ${styles[band]}`}>
      {label}
    </span>
  )
}
