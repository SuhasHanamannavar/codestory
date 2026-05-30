import { Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import StoryPage from './pages/StoryPage'
import AboutPage from './pages/AboutPage'
import HowItWorksPage from './pages/HowItWorksPage'
import DocumentationPage from './pages/DocumentationPage'
import TurnoverGuardPage from './pages/TurnoverGuardPage'


function App() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/legacy" element={<LandingPage />} />
        <Route path="/story" element={<StoryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/documentation" element={<DocumentationPage />} />
        <Route path="/turnover-guard" element={<TurnoverGuardPage />} />
      </Routes>
    </div>
  )
}

export default App
