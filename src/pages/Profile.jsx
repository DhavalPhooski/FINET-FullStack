import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useJourney } from '../context/JourneyContext'
import { LogOut, User, Mail, Phone, Calendar, Shield, Award, Edit3, Key } from 'lucide-react'

export default function Profile() {
  const { user, logout } = useAuth()
  const { journey } = useJourney()
  
  if (!user) return null

  const fullName = user.full_name || user.email?.split('@')[0] || 'Protocol User'
  const subjectLabel = journey.profile?.tierInfo?.label || 'Novice'
  const place = user.location || journey.profile?.answers?.location || journey.profile?.answers?.place || 'Private'
  const accessLevel = journey.profile?.tierInfo?.label
    ? `Level ${journey.level} ${journey.profile.tierInfo.label}`
    : `Level ${journey.level}`

  const stats = [
    { label: 'Intelligence Level', value: `L${journey.level}`, icon: Award, color: 'var(--accent-indigo)' },
    { label: 'Knowledge Points', value: `${journey.xp} XP`, icon: Shield, color: 'var(--yellow)' },
    { label: 'Active Streak', value: `${journey.streak} Days`, icon: Key, color: 'var(--green)' },
  ]

  return (
    <div className="anim-fade" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ marginBottom: 0 }}>Human Intelligence Detail</h1>
        <button className="btn btn-secondary" onClick={logout} style={{ color: 'var(--red)', borderColor: 'rgba(244,63,94,0.2)' }}>
          <LogOut size={16} /> Terminate Session
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        {/* Left Col: Avatar & Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ 
              width: 100, height: 100, borderRadius: '50%', background: 'var(--accent-indigo)', 
              margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', fontWeight: 800, color: '#fff', boxShadow: '0 0 30px rgba(99,102,241,0.3)'
            }}>
              {fullName ? fullName[0].toUpperCase() : '?'}
            </div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 4 }}>{fullName}</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {subjectLabel} Subject
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div className="nav-section-label" style={{ padding: '0 0 12px 0' }}>Reputation Stats</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {stats.map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <s.icon size={16} color={s.color} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Personal Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <div className="flex-between" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 0 }}>Identity Parameters</h3>
              <Edit3 size={16} className="text-muted" style={{ cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', padding: '4px 0' }}>{fullName}</div>
              </div>
              <div className="input-group">
                <label className="input-label">Access Level</label>
                <div style={{ fontSize: '0.95rem', color: 'var(--green)', padding: '4px 0', fontWeight: 600 }}>{accessLevel}</div>
              </div>
              <div className="input-group">
                <label className="input-label">Email Node</label>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', padding: '4px 0' }}>{user.email || 'None connected'}</div>
              </div>
              <div className="input-group">
                <label className="input-label">Place</label>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', padding: '4px 0' }}>{place || 'Private'}</div>
              </div>
              <div className="input-group">
                <label className="input-label">Phone Reference</label>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', padding: '4px 0' }}>{user.phone || 'Private'}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Protocol Metadata</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Calendar size={18} className="text-muted" />
                <div>
                  <div style={{ fontSize: '0.85rem' }}>Protocol Enrollment</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created on {new Date(user.created_at || Date.now()).toLocaleDateString()}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Shield size={18} className="text-muted" />
                <div>
                  <div style={{ fontSize: '0.85rem' }}>Two-Factor Encryption</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--yellow)', fontWeight: 600 }}>Enable for +50 XP bonus</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
