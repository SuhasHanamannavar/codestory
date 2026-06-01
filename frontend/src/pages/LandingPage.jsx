import { useNavigate } from 'react-router-dom'
import MultiLayerLayout from '../components/MultiLayerLayout'
import Navbar from '../components/Navbar'
import LandingHero from '../components/LandingHero'
import HowItWorks from '../components/HowItWorks'
import FeaturesGrid from '../components/FeaturesGrid'
import TechStackRow from '../components/TechStackRow'
import CTABanner from '../components/CTABanner'

export default function LandingPage() {
  const navigate = useNavigate()

  const handleAnalyze = (url) => {
    localStorage.setItem('codestory_url', url)
    navigate('/dashboard')
  }

  return (
    <MultiLayerLayout>
      <Navbar />
      <LandingHero onAnalyze={handleAnalyze} />
      <StatsBarSection />
      <HowItWorks />
      <FeaturesGrid />
      <TechStackRow />
      <CTABanner onAnalyze={handleAnalyze} />
      <FooterSection />
    </MultiLayerLayout>
  )
}

function StatsBarSection() {
  const stats = [
    { value: '12,000+', label: 'Repos analyzed' },
    { value: '3', label: 'AI agents' },
    { value: '30-day', label: 'Rescue plans' },
    { value: '100%', label: 'Open source' },
  ]

  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-extrabold gradient-text">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FooterSection() {
  return (
    <footer className="py-12 border-t border-dark-border">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="TG" className="w-8 h-8 rounded-full" />
            <span className="text-sm text-gray-500">TurnoverGuard © 2026</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>About</span>
            <span>Documentation</span>
            <span>GitHub</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
