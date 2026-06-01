import MatrixBackground from './MatrixBackground'
import AmbientGlow from './AmbientGlow'
import GridBackground from './GridBackground'

export default function MultiLayerLayout({ children }) {
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--bg-deep)' }}>
      <MatrixBackground />
      <AmbientGlow />
      <GridBackground />
      <div className="relative" style={{ zIndex: 20 }}>
        {children}
      </div>
    </div>
  )
}
