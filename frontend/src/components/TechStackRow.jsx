import { motion } from 'framer-motion'

const TECH = [
  'FastAPI', 'Python', 'React', 'Tailwind CSS',
  'Cytoscape.js', 'Groq LLM', 'httpx', 'Framer Motion',
]

export default function TechStackRow() {
  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs text-gray-600 tracking-widest uppercase mb-6"
        >
          Powered by
        </motion.p>
        <div className="flex flex-wrap justify-center gap-3">
          {TECH.map((t, i) => (
            <motion.span
              key={t}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="px-4 py-2 glass rounded-full text-sm text-gray-400 font-mono border border-dark-border"
            >
              {t}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  )
}
