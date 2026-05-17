import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function CodeParticles() {
  const [particles, setParticles] = useState([])
  
  useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789{}[]()=>'
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      char: chars[Math.floor(Math.random() * chars.length)],
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 5
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.span
          key={p.id}
          initial={{ opacity: 0, y: '100vh' }}
          animate={{ 
            opacity: [0, 0.5, 0],
            y: ['100vh', '-10vh'],
            x: [0, Math.random() * 100 - 50]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="absolute text-primary-purple/20 text-lg font-mono"
          style={{ left: `${p.x}%` }}
        >
          {p.char}
        </motion.span>
      ))}
    </div>
  )
}