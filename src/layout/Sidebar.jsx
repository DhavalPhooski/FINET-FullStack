import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Network, PieChart,
  Users, Newspaper, Users2,
  TrendingUp, Landmark, Zap, Sparkles, LogOut, ChevronRight, FileText
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useJourney } from '../context/JourneyContext'

const NAV_CORE = [
  { to: '/',       label: 'Overview',    icon: LayoutDashboard },
  { to: '/graph',  label: 'Flow Nodes',  icon: Network },
  { to: '/budget', label: 'Allocations', icon: PieChart },
]

const NAV_INTEL = [
  { to: '/news',      label: 'Intelligence', icon: Newspaper },
  { to: '/report',    label: 'Intel Brief',  icon: FileText },
  { to: '/mentors',   label: 'Experts',      icon: Users },
  { to: '/community', label: 'Hub',          icon: Users2 },
]

const NAV_ASSETS = [
  { to: '/investments', label: 'Equity',    icon: TrendingUp },
  { to: '/loans',       label: 'Liability', icon: Landmark },
]

function NavItem({ n }) {
  return (
    <NavLink
      to={n.to} end={n.to === '/'}
      className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
    >
      {({ isActive }) => (
        <>
          <n.icon size={18} strokeWidth={isActive ? 2 : 1.5} color={isActive ? 'var(--text-primary)' : 'var(--text-muted)'} />
          <span style={{ fontWeight: 500, letterSpacing: '-0.01em' }}>{n.label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { journey, levelProgress, xpInLevel, xpToNextLevel } = useJourney()
  const profile = journey?.profile

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="nav-logo" style={{ marginBottom: 28 }}>
        <div style={{ padding: 6, background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))', borderRadius: 8, display: 'flex' }}>
          <Zap size={16} strokeWidth={2.5} color="#fff" />
        </div>
        <span style={{ background: 'linear-gradient(180deg, #fff 0%, #a1a1aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700, letterSpacing: '-0.05em', fontSize: '1.4rem' }}>
          Finet
        </span>
      </div>

      {/* User Progress Card */}
      {user && (
        <div style={{ 
          margin: '0 0 24px', padding: '16px', background: 'rgba(255,255,255,0.02)', 
          border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ 
              width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-indigo)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#fff'
            }}>
              L{journey.level}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.full_name || 'Protocol User'}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {profile?.tierInfo?.label || 'Novice'} Tier
              </div>
            </div>
          </div>
          
          <div className="progress-wrap">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <span>PROG</span>
              <span>{xpInLevel} / {xpToNextLevel} XP</span>
            </div>
            <div className="progress-track" style={{ height: 3, border: 'none', background: 'rgba(255,255,255,0.05)' }}>
              <div className="progress-fill" style={{ width: `${levelProgress}%`, background: 'var(--accent-indigo)' }} />
            </div>
          </div>
        </div>
      )}

      {/* AI Coach CTA */}
      <NavLink to="/coach"
        className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
        style={({ isActive }) => ({
          margin: '4px 0 8px',
          background: isActive ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 'var(--radius-sm)',
        })}
      >
        {({ isActive }) => (
          <>
            <Sparkles size={18} strokeWidth={isActive ? 2 : 1.5} color="var(--accent-indigo)" />
            <span style={{ fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--accent-indigo)' }}>AI Coach</span>
          </>
        )}
      </NavLink>

      <div className="nav-section-label">Core System</div>
      {NAV_CORE.map(n => <NavItem key={n.to} n={n} />)}

      <div className="nav-section-label">Intelligence</div>
      {NAV_INTEL.map(n => <NavItem key={n.to} n={n} />)}

      <div className="nav-section-label">Assets</div>
      {NAV_ASSETS.map(n => <NavItem key={n.to} n={n} />)}

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button onClick={logout} className="nav-item" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', padding: '8px 16px' }}>
          <LogOut size={16} color="var(--red)" />
          <span style={{ color: 'var(--red)', opacity: 0.8 }}>Secure Exit</span>
        </button>
        <div style={{ padding: '0 16px', opacity: 0.4 }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.12em', fontWeight: 700 }}>PROTOCOL V5.2.0</div>
        </div>
      </div>
    </aside>
  )
}
