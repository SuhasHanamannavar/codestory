import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MultiLayerLayout from '../components/MultiLayerLayout'

const MIRAGE_API = 'http://localhost:8001/api/web-event'

const fakeCards = [
  {
    title: 'API Keys',
    lines: [
      'sk_live_••••••••••••••••a3f8',
      'pk_live_••••••••••••••••b2c1',
      'sk_test_••••••••••••••••d4e7',
    ],
    color: '#7c3aed',
  },
  {
    title: 'Database Credentials',
    lines: [
      'host: pg-primary.internal',
      'user: turnover_admin',
      'pass: ••••••••••••••••',
    ],
    color: '#2563eb',
  },
  {
    title: 'Employee Records',
    lines: [
      'sarah.chen@turnoverguard.dev',
      'marcus.johnson@turnoverguard.dev',
      'elena.rodriguez@turnoverguard.dev',
    ],
    color: '#06b6d4',
  },
  {
    title: 'SSH Access Logs',
    lines: [
      '203.0.113.42 — 2 min ago',
      '198.51.100.7 — 15 min ago',
      '192.0.2.88 — 1 hour ago',
    ],
    color: '#f59e0b',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.4 + i * 0.12, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function TrapPage() {
  const [ip, setIp] = useState('')
  const [posted, setPosted] = useState(false)
  const [time, setTime] = useState(0)

  useEffect(() => {
    const sessionId = crypto.randomUUID()

    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(data => {
        const detectedIp = data.ip
        setIp(detectedIp)

        return fetch(MIRAGE_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            src_ip: detectedIp,
            action: 'HONEYPOT_TRIGGERED',
            attack_type: 'WEB_ATTACKER',
            confidence: 0.95,
          }),
        })
      })
      .then(() => setPosted(true))
      .catch(() => setPosted(true))
  }, [])

  useEffect(() => {
    if (!posted) return
    const interval = setInterval(() => setTime(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [posted])

  const minutes = Math.floor(time / 60)
  const seconds = time % 60

  return (
    <MultiLayerLayout>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            ⚠️
          </motion.div>
          <h1 className="text-4xl font-bold text-red-400 mb-3">SECURITY BREACH DETECTED</h1>
          <p className="text-gray-400 text-lg">Internal Admin Console — Unauthorized Access</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl mb-8">
          {fakeCards.map((card, i) => (
            <motion.div
              key={card.title}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="glass-card rounded-xl p-5"
              style={{ borderColor: `${card.color}30` }}
            >
              <h3 className="text-sm font-semibold tracking-wider uppercase mb-3" style={{ color: card.color }}>
                {card.title}
              </h3>
              <div className="space-y-1.5">
                {card.lines.map((line, j) => (
                  <p key={j} className="text-sm text-gray-300 font-mono">{line}</p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="glass rounded-xl px-6 py-4 text-center max-w-lg w-full"
        >
          {ip ? (
            <>
              <p className="text-gray-300">
                Your IP:{' '}
                <span className="text-red-400 font-mono font-bold">{ip}</span>
              </p>
              <p className="text-gray-500 text-sm mt-1">All activity is being recorded</p>
            </>
          ) : (
            <p className="text-gray-500">Capturing location data...</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          className="mt-6 flex items-center gap-3 text-gray-500 text-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          Recording session — {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </motion.div>
      </div>
    </MultiLayerLayout>
  )
}
