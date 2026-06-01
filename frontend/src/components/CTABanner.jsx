import { useState } from 'react'
import { motion } from 'framer-motion'

export default function CTABanner({ onAnalyze }) {
  const [url, setUrl] = useState('')

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card-elevated p-8 md:p-12 text-center relative overflow-hidden"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 60%)',
            }}
          />

          <div className="relative">
            <div className="text-4xl mb-4">🛡️</div>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight">
              Ready to assess your{' '}
              <span className="gradient-text">team's bus factor</span>?
            </h2>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto">
              Paste any public GitHub repo and get your ownership analysis, risk scores, and rescue plan — instantly.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (url.trim()) onAnalyze?.(url.trim())
              }}
              className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
            >
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className="flex-1 px-5 py-4 rounded-xl text-base glow-input text-white placeholder-gray-500"
              />
              <motion.button
                type="submit"
                disabled={!url.trim()}
                whileHover={url.trim() ? { scale: 1.03 } : {}}
                whileTap={url.trim() ? { scale: 0.97 } : {}}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-primary elevation-glow disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Analyze Risk →
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
