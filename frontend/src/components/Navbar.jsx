import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-2xl px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="CodeStory Logo" className="w-12 h-12 object-contain" style={{ mixBlendMode: 'screen' }} />
            <div className="flex flex-col">
              <span className="text-xl font-extrabold leading-tight tracking-wider">CODE STORY</span>
              <span className="text-[10px] text-gray-400 tracking-[0.15em] font-medium leading-none mt-1">FROM CODE TO NARRATIVE</span>
            </div>
          </Link>
          
           <div className="hidden md:flex items-center gap-8">
             <Link to="/" className="text-sm tracking-wider text-gray-300 hover:text-white transition-colors uppercase">
               Dashboard
             </Link>
             <Link to="/about" className="text-sm tracking-wider text-gray-300 hover:text-white transition-colors uppercase">
               About
             </Link>
             <Link to="/how-it-works" className="text-sm tracking-wider text-gray-300 hover:text-white transition-colors uppercase">
               How It Works
             </Link>
             <Link to="/documentation" className="text-sm tracking-wider text-gray-300 hover:text-white transition-colors uppercase">
               Documentation
             </Link>
           </div>
        </div>
      </div>
    </motion.nav>
  )
}
