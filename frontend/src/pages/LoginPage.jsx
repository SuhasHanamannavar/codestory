import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import MultiLayerLayout from '../components/MultiLayerLayout'

const DEMO_EMAIL = 'admin@turnoverguard.dev'
const DEMO_PASSWORD = 'Admin@2026'
const MAX_ATTEMPTS = 5
const STORAGE_KEY = 'tg_login_attempts'
const MIRAGE_API = 'http://localhost:8001/api/web-event'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [failedAttempts, setFailedAttempts] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? parseInt(stored, 10) : 0
  })
  const [shake, setShake] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (failedAttempts >= MAX_ATTEMPTS) {
      const sessionId = crypto.randomUUID()
      localStorage.setItem('tg_session_id', sessionId)
      localStorage.setItem('tg_trap_triggered', 'true')
      localStorage.removeItem(STORAGE_KEY)

      const detectedIp = localStorage.getItem('tg_ip')
      fetch(MIRAGE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          src_ip: detectedIp || 'unknown',
          action: 'LOGIN_FAILED_5X — redirecting to internal console',
          attack_type: 'WEB_ATTACKER',
          confidence: 0.95,
        }),
      }).catch(() => {})

      navigate('/trap', { replace: true })
    }
  }, [failedAttempts, navigate])

  useEffect(() => {
    if (!localStorage.getItem('tg_ip')) {
      fetch('https://api.ipify.org?format=json')
        .then(r => r.json())
        .then(d => localStorage.setItem('tg_ip', d.ip))
        .catch(() => {})
    }
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      localStorage.removeItem(STORAGE_KEY)
      navigate('/dashboard', { replace: true })
      return
    }
    const newCount = failedAttempts + 1
    setFailedAttempts(newCount)
    localStorage.setItem(STORAGE_KEY, String(newCount))
    setError('Invalid email or password.')
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  return (
    <MultiLayerLayout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={shake ? { x: [0, -10, 10, -6, 6, -3, 3, 0], opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: shake ? 0.35 : 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card-elevated w-full max-w-md p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">TurnoverGuard</h1>
            <p className="text-gray-400 text-sm">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="glow-input w-full px-4 py-3 text-white placeholder-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glow-input w-full px-4 py-3 text-white placeholder-gray-500"
                required
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              className="glow-button w-full py-3 text-white font-semibold tracking-wide"
            >
              Sign In
            </button>
          </form>
        </motion.div>
      </div>
    </MultiLayerLayout>
  )
}
