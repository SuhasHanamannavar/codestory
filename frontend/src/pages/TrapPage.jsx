import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import MatrixBackground from '../components/MatrixBackground'
import AmbientGlow from '../components/AmbientGlow'
import GridBackground from '../components/GridBackground'

const MIRAGE_API = 'http://localhost:8001/api/web-event'

const employees = [
  { name: 'Sarah Chen', role: 'Chief Technology Officer', email: 'sarah.chen@turnoverguard.dev', active: '2 min ago' },
  { name: 'Marcus Johnson', role: 'Lead Engineer', email: 'marcus.j@turnoverguard.dev', active: '5 min ago' },
  { name: 'Elena Rodriguez', role: 'DevOps Manager', email: 'elena.r@turnoverguard.dev', active: '12 min ago' },
  { name: 'Alex Kovacs', role: 'Security Analyst', email: 'alex.k@turnoverguard.dev', active: '1 min ago' },
  { name: 'Priya Sharma', role: 'Data Engineer', email: 'priya.s@turnoverguard.dev', active: '8 min ago' },
  { name: 'James Whitfield', role: 'Backend Developer', email: 'james.w@turnoverguard.dev', active: '3 min ago' },
]

const apiKeys = [
  { name: 'Production API', key: 'sk_live_turnoverguard_prod_a3f8e2c1b4d7', copied: false },
  { name: 'Billing Gateway', key: 'pk_live_turnoverguard_bill_9d2e4f6a8c0b', copied: false },
  { name: 'Internal Services', key: 'sk_live_tg_internal_7b3n5m8k2j1h', copied: false },
]

const servers = [
  { name: 'app-01', ip: '10.0.1.5', status: 'online', uptime: '47d 12h' },
  { name: 'db-primary', ip: '10.0.2.1', status: 'online', uptime: '92d 3h' },
  { name: 'cache-01', ip: '10.0.3.2', status: 'online', uptime: '31d 8h' },
  { name: 'worker-02', ip: '10.0.4.7', status: 'online', uptime: '18d 22h' },
]

export default function TrapPage() {
  const [sessionId] = useState(() => localStorage.getItem('tg_session_id') || crypto.randomUUID())
  const [ip, setIp] = useState(() => localStorage.getItem('tg_ip') || '')
  const [selectedSection, setSelectedSection] = useState('employees')
  const [visible, setVisible] = useState(true)
  const [copiedKey, setCopiedKey] = useState(null)

  const track = useCallback((action) => {
    const srcIp = ip || localStorage.getItem('tg_ip') || 'unknown'
    fetch(MIRAGE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        src_ip: srcIp,
        action,
        attack_type: 'WEB_ATTACKER',
        confidence: 0.95,
      }),
    }).catch(() => {})
  }, [sessionId, ip])

  useEffect(() => {
    if (ip) return
    const cached = localStorage.getItem('tg_ip')
    if (cached) {
      setIp(cached)
      return
    }
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => {
        const detectedIp = d.ip
        localStorage.setItem('tg_ip', detectedIp)
        setIp(detectedIp)
      })
      .catch(() => {})
  }, [ip])

  useEffect(() => {
    if (!ip) return
    track('LOGIN_SUCCESS — admin@turnoverguard.dev')
  }, [ip, track])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setVisible(false)
        track('TAB_AWAY')
      } else {
        setVisible(true)
        track('TAB_RETURN')
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [track])

  useEffect(() => {
    const heartbeat = setInterval(() => {
      track('HEARTBEAT — browsing')
    }, 20000)
    return () => clearInterval(heartbeat)
  }, [track])

  function selectSection(section, label) {
    setSelectedSection(section)
    track(`VIEW_${label}`)
  }

  function selectEmployee(name) {
    track(`SELECT_EMPLOYEE — ${name}`)
  }

  function handleCopyKey(name, key) {
    setCopiedKey(name)
    track(`COPY_API_KEY — ${name}`)
    navigator.clipboard.writeText(key).catch(() => {})
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--bg-deep)' }}>
      <MatrixBackground />
      <AmbientGlow />
      <GridBackground />
      <div className="relative" style={{ zIndex: 20 }}>
        <Navbar />

        <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Internal Admin Console</h1>
                <p className="text-gray-500 text-sm mt-1">Welcome back, Admin — you are signed in as <span className="text-primary-purpleLight">admin@turnoverguard.dev</span></p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold">A</div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: '2,847', sub: '+12 this week' },
              { label: 'Employees', value: '342', sub: '6 departments' },
              { label: 'Repositories', value: '28', sub: '12 private' },
              { label: 'API Requests', value: '3.2k', sub: 'Avg 4.5ms response' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card rounded-xl p-5"
              >
                <p className="text-gray-500 text-xs tracking-wider uppercase mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-600 text-xs mt-1">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2 mb-6">
            {[
              { id: 'employees', label: 'Employees' },
              { id: 'api-keys', label: 'API Keys' },
              { id: 'infrastructure', label: 'Infrastructure' },
              { id: 'activity', label: 'Activity Log' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => selectSection(tab.id, tab.label.toUpperCase().replace(' ', '_'))}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedSection === tab.id
                    ? 'bg-gradient-primary text-white shadow-lg shadow-purple-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-dark-surface border border-dark-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {selectedSection === 'employees' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card rounded-xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Employee Directory</h3>
                <span className="text-xs text-gray-500">{employees.length} records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-border">
                      <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Name</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Role</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Email</th>
                      <th className="text-right px-6 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, i) => (
                      <motion.tr
                        key={emp.name}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.25 }}
                        onClick={() => selectEmployee(emp.name)}
                        className="border-b border-dark-border/50 cursor-pointer transition-colors hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-3.5 text-sm text-white">{emp.name}</td>
                        <td className="px-6 py-3.5 text-sm text-gray-400">{emp.role}</td>
                        <td className="px-6 py-3.5 text-sm text-primary-purpleLight">{emp.email}</td>
                        <td className="px-6 py-3.5 text-sm text-gray-500 text-right">{emp.active}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {selectedSection === 'api-keys' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card rounded-xl p-6"
            >
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">API Keys</h3>
              <div className="space-y-3">
                {apiKeys.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-4 rounded-lg bg-dark-surface/50 border border-dark-border"
                  >
                    <div>
                      <p className="text-sm text-gray-300 font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-1">{item.key}</p>
                    </div>
                    <button
                      onClick={() => handleCopyKey(item.name, item.key)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-dark-border text-gray-400 hover:text-white hover:border-primary-purple/40 transition-all"
                    >
                      {copiedKey === item.name ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {selectedSection === 'infrastructure' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card rounded-xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-dark-border">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Infrastructure Status</h3>
              </div>
              <div className="divide-y divide-dark-border/50">
                {servers.map((srv) => (
                  <div key={srv.name} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
                      <span className="text-sm text-white font-medium">{srv.name}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-xs text-gray-500 font-mono">{srv.ip}</span>
                      <span className="text-xs text-green-500/80 font-medium uppercase tracking-wider">{srv.status}</span>
                      <span className="text-xs text-gray-500">Uptime: {srv.uptime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {selectedSection === 'activity' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card rounded-xl p-6"
            >
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { user: 'Sarah Chen', action: 'Deployed v3.2.1 to production', time: '2 min ago' },
                  { user: 'Alex Kovacs', action: 'Ran security audit — 0 critical findings', time: '7 min ago' },
                  { user: 'Marcus Johnson', action: 'Merged PR #284 — caching layer optimization', time: '14 min ago' },
                  { user: 'Priya Sharma', action: 'Scheduled data pipeline refresh', time: '23 min ago' },
                  { user: 'System', action: 'Automated backup completed — 4.2 GB', time: '31 min ago' },
                ].map((entry) => (
                  <div key={entry.time} className="flex items-center justify-between py-2 border-b border-dark-border/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white">{entry.user}</span>
                      <span className="text-sm text-gray-400">{entry.action}</span>
                    </div>
                    <span className="text-xs text-gray-500">{entry.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
