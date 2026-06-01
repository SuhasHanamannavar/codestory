import { useMemo } from 'react'

const ORBS = [
  { color: 'rgba(124, 58, 237, 0.12)', size: 600, x: '10%', y: '20%', anim: 'animate-float-slow' },
  { color: 'rgba(37, 99, 235, 0.08)', size: 500, x: '75%', y: '15%', anim: 'animate-float-medium' },
  { color: 'rgba(6, 182, 212, 0.06)', size: 400, x: '50%', y: '60%', anim: 'animate-float-slow' },
  { color: 'rgba(124, 58, 237, 0.06)', size: 350, x: '85%', y: '70%', anim: 'animate-float-medium' },
  { color: 'rgba(37, 99, 235, 0.05)', size: 450, x: '20%', y: '80%', anim: 'animate-float-slow' },
  { color: 'rgba(168, 85, 247, 0.04)', size: 300, x: '60%', y: '30%', anim: 'animate-float-medium' },
]

export default function AmbientGlow() {
  const orbs = useMemo(() => ORBS, [])

  return (
    <div className="layer-ambient fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={orb.anim}
          style={{
            position: 'absolute',
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            marginLeft: -orb.size / 2,
            marginTop: -orb.size / 2,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            borderRadius: '50%',
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  )
}
