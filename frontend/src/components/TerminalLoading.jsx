import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const terminalLines = [
  { cmd: 'git clone', desc: 'Cloning repository...', delay: 0 },
  { cmd: 'analyzing', desc: 'Scanning codebase structure...', delay: 800 },
  { cmd: 'parsing', desc: 'Reading lines of code...', delay: 1600 },
  { cmd: 'understanding', desc: 'Decoding architecture patterns...', delay: 2400 },
  { cmd: 'AI synthesizing', desc: 'Crafting your story...', delay: 3200 },
]

function TerminalLine({ cmd, desc, delay, active }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  if (!show) return null

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-2 font-mono text-sm">
      <span className="text-primary-purple">$</span>
      <span className="text-blue-400">{cmd}</span>
      <span className="text-gray-500">{desc}</span>
      {active && (
        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="w-2 h-4 bg-primary-purple rounded" />
      )}
    </motion.div>
  )
}

export default function TerminalLoading({ repoName }) {
  const [activeLine, setActiveLine] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLine(l => (l < terminalLines.length - 1 ? l + 1 : l))
    }, 800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="pt-32 flex items-center justify-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass rounded-2xl p-8 w-full max-w-2xl border border-primary-purple/30">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-4">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-4 text-gray-500 text-sm font-mono">CodeStory Terminal</span>
        </div>
        
        <div className="mb-4 text-sm text-gray-400 font-mono">
          <span className="text-primary-purple">root@codestory</span>:<span className="text-blue-400">~</span>$ ./analyze.sh {repoName || 'repository'}
        </div>

        <div className="space-y-2 mb-6">
          {terminalLines.map((line, i) => (
            <TerminalLine key={i} {...line} active={i === activeLine} />
          ))}
        </div>

        <div className="flex justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 border-4 border-primary-purple/30 border-t-primary-purple rounded-full" />
        </div>

        <div className="text-center mt-4 text-gray-500 text-sm">
          Processing your repository with AI...
        </div>
      </motion.div>
    </div>
  )
}