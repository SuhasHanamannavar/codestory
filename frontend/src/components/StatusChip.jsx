export default function StatusChip({ tone = 'neutral', label }) {
  const base = 'px-3 py-1 rounded-full text-xs font-mono border'
  const tones = {
    neutral: 'bg-dark-bg/60 border-dark-border text-gray-300',
    ok: 'bg-green-500/10 border-green-500/30 text-green-300',
    warn: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    bad: 'bg-red-500/10 border-red-500/30 text-red-300',
    accent: 'bg-primary-purple/10 border-primary-purple/30 text-primary-purpleLight'
  }
  return <span className={`${base} ${tones[tone] || tones.neutral}`}>{label}</span>
}
