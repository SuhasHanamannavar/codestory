import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const navEase = { duration: 0.4, ease: [0.16, 1, 0.3, 1] }

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/turnover-guard', label: 'TurnoverGuard' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/documentation', label: 'Docs' },
]

function NavLink({ to, label, isActive }) {
  return (
    <Link
      to={to}
      className={`relative text-sm tracking-wider uppercase transition-colors ${
        isActive ? 'text-white' : 'text-gray-400 hover:text-white'
      }`}
      style={{ transitionDuration: '120ms', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      {label}
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-primary rounded-full"
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
    </Link>
  )
}

export default function Navbar() {
  const location = useLocation()

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={navEase}
      className="fixed top-0 left-0 right-0 px-6 py-4"
      style={{ zIndex: 50 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass elevation-md rounded-2xl px-6 py-3 flex items-center justify-between border border-primary-purple/10">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.jpg"
              alt="TurnoverGuard"
              className="w-10 h-10 transition-transform duration-250 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-lg font-extrabold leading-tight tracking-wider gradient-text">TURNOVER GUARD</span>
              <span className="text-[10px] text-gray-500 tracking-[0.15em] font-medium leading-none mt-0.5">FROM CODE TO NARRATIVE</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                {...link}
                isActive={location.pathname === link.to}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
