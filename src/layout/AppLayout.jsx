import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import FloatingCoach from '../components/chat/FloatingCoach'
import Onboarding from '../components/Onboarding'
import { useJourney } from '../context/JourneyContext'

function PageTracker() {
  const location = useLocation()
  const { trackPage } = useJourney()
  React.useEffect(() => { trackPage(location.pathname) }, [location.pathname])
  return null
}

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`mobile-backdrop${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <div className="main-area">
        <Topbar onToggleMenu={() => setSidebarOpen((current) => !current)} />
        <main className="page-content">
          <PageTracker />
          {children}
        </main>
      </div>
      <FloatingCoach />
      <Onboarding />
    </div>
  )
}