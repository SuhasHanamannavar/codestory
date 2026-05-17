import { motion } from 'framer-motion'

export default function StatsBar() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.5, duration: 0.6 }}
      className="max-w-2xl mx-auto text-center"
    >
      <p className="text-xl md:text-2xl font-light text-gray-300 italic">
        Code is like humor. When you have to explain it, it's bad.
      </p>
    </motion.div>
  )
}