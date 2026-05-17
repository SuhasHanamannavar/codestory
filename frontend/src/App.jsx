import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import StoryPage from './pages/StoryPage'
import AboutPage from './pages/AboutPage'
import HowItWorksPage from './pages/HowItWorksPage'
import DocumentationPage from './pages/DocumentationPage'

function App() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/story" element={<StoryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/documentation" element={<DocumentationPage />} />
      </Routes>
    </div>
  )
}

export default App