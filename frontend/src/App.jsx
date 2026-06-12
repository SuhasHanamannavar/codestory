import { Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import StoryPage from './pages/StoryPage'
import AboutPage from './pages/AboutPage'
import HowItWorksPage from './pages/HowItWorksPage'
import DocumentationPage from './pages/DocumentationPage'
import TurnoverGuardPage from './pages/TurnoverGuardPage'
import LoginPage from './pages/LoginPage'
import TrapPage from './pages/TrapPage'

function App() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-deep)' }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/legacy" element={<LandingPage />} />
        <Route path="/story" element={<StoryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/documentation" element={<DocumentationPage />} />
        <Route path="/turnover-guard" element={<TurnoverGuardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/trap" element={<TrapPage />} />
      </Routes>
    </div>
  )
}

export default App
