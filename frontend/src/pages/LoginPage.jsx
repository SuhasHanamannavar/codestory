import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import MultiLayerLayout from '../components/MultiLayerLayout'

const DEMO_EMAIL = 'admin@turnoverguard.dev'
const DEMO_PASSWORD = 'Admin@2026'
const MAX_ATTEMPTS = 5
const STORAGE_KEY = 'tg_login_attempts'

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

  const remaining = MAX_ATTEMPTS - failedAttempts

  useEffect(() => {
    if (failedAttempts >= MAX_ATTEMPTS) {
      localStorage.setItem('tg_trap_triggered', 'true')
      navigate('/trap', { replace: true })
    }
  }, [failedAttempts, navigate])

  function triggerShake(msg) {
    setError(msg)
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

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
    const msg = newCount >= MAX_ATTEMPTS
      ? 'Maximum attempts exceeded. Redirecting...'
      : `Invalid credentials. ${remaining - 1} attempt(s) remaining.`
    triggerShake(msg)
  }

  const isLocked = failedAttempts >= MAX_ATTEMPTS

  return (
    <MultiLayerLayout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={shake ? { x: [0, -12, 12, -8, 8, -4, 4, 0], opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: shake ? 0.4 : 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card-elevated w-full max-w-md p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">TurnoverGuard</h1>
            <p className="text-gray-400 text-sm">Sign in to access your dashboard</p>
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
                disabled={isLocked}
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
                disabled={isLocked}
                required
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-red-400 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLocked}
              className="glow-button w-full py-3 text-white font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLocked ? 'ACCESS LOCKED' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-dark-border">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Attempts: {failedAttempts}/{MAX_ATTEMPTS}</span>
              <span className="text-primary-purpleLight">Demo: admin@turnoverguard.dev</span>
            </div>
            <div className="mt-2 w-full bg-dark-surface rounded-full h-1 overflow-hidden">
              <motion.div
                className="h-full"
                style={{
                  background: 'linear-gradient(90deg, #ef4444, #f59e0b, #22c55e)',
                  width: `${100 - (failedAttempts / MAX_ATTEMPTS) * 100}%`
                }}
                layout
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </MultiLayerLayout>
  )
}
