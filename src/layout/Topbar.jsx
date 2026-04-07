import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMarketData } from '../hooks/useMarketData'
import { Wallet, Flame, Bell, Sparkles } from 'lucide-react'
import { useJourney } from '../context/JourneyContext'
import { useAuth } from '../hooks/useAuth'
import { AppContext } from '../App'

export default function Topbar() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { journey } = useJourney()
  const { income, setIncome } = React.useContext(AppContext)
  const market = useMarketData()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const handleEdit = () => { setDraft(String(income)); setEditing(true) }
  const handleSave = () => {
    const v = Number(draft)
    if (v > 0) setIncome(v)
    setEditing(false)
  }

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.12em', fontWeight: 700, textTransform: 'uppercase' }}>FINANCE / {window.location.pathname.replace('/','').toUpperCase() || 'OVERVIEW'}</div>
      </div>

      {/* 2. System Status & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Income Pulse / Digital Vault */}
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: 10, 
          padding: '4px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', 
          border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
        >
          <Wallet size={14} color="var(--text-muted)" />
          {editing ? (
            <input
              autoFocus
              className="input"
              style={{ 
                width: 80, background: 'transparent', border: 'none', 
                height: 20, padding: 0, textAlign: 'center', boxShadow: 'none'
              }}
              type="number"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={handleSave}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false) }}
            />
          ) : (
            <span onClick={handleEdit} style={{ 
              fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center'
            }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginRight: 2 }}>₹</span>
              {income.toLocaleString()}
            </span>
          )}
        </div>

        {/* Global Capsules */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ 
            display: 'flex', gap: 6, alignItems: 'center', padding: '4px 10px', 
            borderRadius: 20, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
            color: 'var(--accent-indigo)', fontSize: '0.7rem', fontWeight: 800, fontFamily: 'var(--font-mono)'
          }}>
            <Sparkles size={12} fill="currentColor" />
            {journey.xp} XP
          </div>
          <div style={{ 
            display: 'flex', gap: 6, alignItems: 'center', padding: '4px 10px', 
            borderRadius: 20, background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)',
            color: 'var(--yellow)', fontSize: '0.7rem', fontWeight: 800, fontFamily: 'var(--font-mono)'
          }}>
            <Flame size={12} fill="currentColor" />
            {journey.streak}
          </div>
          <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', background: 'rgba(255,255,255,0.02)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
          >
            <Bell size={14} className="text-muted" />
          </div>
        </div>

        {/* Profile Token */}
        <div 
          onClick={() => navigate('/profile')}
          style={{
            width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--accent-indigo)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800,
            background: 'rgba(99,102,241,0.1)',
            color: 'var(--accent-indigo)', cursor: 'pointer', boxShadow: '0 0 12px rgba(99,102,241,0.2)'
          }}
        >
          {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : '??'}
        </div>
      </div>
    </header>
  )
}
