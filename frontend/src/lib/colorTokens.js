export const tokens = {
  bg: '#0a0a0f',
  surface: '#12121a',
  surface2: '#171724',
  border: '#1e1e2e',
  text: '#ffffff',
  textMuted: '#9ca3af',
  accent: '#7c3aed',
  accent2: '#2563eb',
  risk: {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444'
  }
}

export function riskBand(score01) {
  const s = Number.isFinite(score01) ? score01 : 0
  if (s >= 0.67) return 'high'
  if (s >= 0.34) return 'medium'
  return 'low'
}

export function riskLabel(score01) {
  const band = riskBand(score01)
  if (band === 'high') return 'High'
  if (band === 'medium') return 'Medium'
  return 'Low'
}

export function riskColor(score01) {
  return tokens.risk[riskBand(score01)]
}
