import React, { useContext, useMemo } from 'react'
import { AppContext } from '../App'
import { useNavigate } from 'react-router-dom'
import { FeatureInfoBadge } from '../components/FeatureTips'
import { useMarketData } from '../hooks/useMarketData'
import { useJourney } from '../context/JourneyContext'
import { ACHIEVEMENTS } from '../data/appData'
import {
  TrendingUp, TrendingDown, Wallet, ArrowUpRight,
  Activity, Sparkles, Target, Flame, ChevronRight,
  CheckCircle2, BookOpen, BarChart2, Network, Users
} from 'lucide-react'
import FeatureTooltip from '../components/FeatureTooltip'

// ── Health gauge ─────────────────────────────────────────────────────────────
function HealthGauge({ score }) {
  const r = 48, circ = 2 * Math.PI * r
  const filled = circ * (score / 100)
  const color = score >= 80 ? 'var(--green)' : score >= 50 ? 'var(--yellow)' : 'var(--red)'
  return (
    <div style={{ position: 'relative', width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '1.8rem', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.05em' }}>{score}</span>
        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>Index</span>
      </div>
    </div>
  )
}

// ── XP level bar ─────────────────────────────────────────────────────────────
function XPBar({ level, xpInLevel, levelProgress }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-indigo)', fontFamily: 'var(--font-mono)' }}>{level}</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>LEVEL {level}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{xpInLevel}/100 XP</span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
          <div style={{ height: '100%', width: `${levelProgress}%`, background: 'linear-gradient(90deg, var(--accent-indigo), var(--accent-purple))', borderRadius: 4, transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)' }} />
        </div>
      </div>
    </div>
  )
}

// ── Next Suggested Action ─────────────────────────────────────────────────────
const SUGGESTIONS = [
  { condition: (j) => !j.profile,                        icon: Sparkles,  text: 'Complete AI Coach quiz to get your personalized roadmap', path: '/coach',       label: 'Go to Coach' },
  { condition: (j) => !j.visitedPages.includes('/markets'), icon: BarChart2, text: 'Check today\'s Sensex and market movements',              path: '/markets',     label: 'Open Markets' },
  { condition: (j) => !j.visitedPages.includes('/graph'),   icon: Network,   text: 'Set up your budget nodes in the Flow Graph',             path: '/graph',       label: 'Open Flow Nodes' },
  { condition: (j) => !j.visitedPages.includes('/mentors'),  icon: Users,    text: 'Browse expert mentors matched to your goal',             path: '/mentors',     label: 'Meet Experts' },
  { condition: (j) => !j.visitedPages.includes('/news'),     icon: BookOpen, text: 'Read a financial intelligence article today',            path: '/news',        label: 'Read Now' },
  { condition: () => true,                               icon: Target,    text: 'Review your roadmap and mark a milestone as done',         path: '/coach',       label: 'My Roadmap' },
]

function NextAction({ journey, navigate }) {
  const suggestion = SUGGESTIONS.find(s => s.condition(journey))
  if (!suggestion) return null
  const Icon = suggestion.icon
  return (
    <div style={{ padding: '16px 20px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all 0.2s' }}
      onClick={() => navigate(suggestion.path)}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} color="var(--accent-indigo)" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--accent-indigo)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 3 }}>NEXT SUGGESTED ACTION</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{suggestion.text}</div>
      </div>
      <ChevronRight size={16} color="var(--text-muted)" />
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { income, nodes, transactions } = useContext(AppContext)
  const { journey, xpInLevel, levelProgress } = useJourney()
  const market = useMarketData()
  const navigate = useNavigate()

  const totalSpent  = (transactions || []).reduce((s, t) => s + (t.amount || 0), 0)
  const totalSaved  = Math.max(0, (income || 0) - totalSpent)
  const savingsRate = (income || 0) > 0 ? Math.round((totalSaved / income) * 100) : 0

  const healthScore = useMemo(() => {
    let score = 0
    const nodeArr = nodes || []
    const txArr = transactions || []
    const totalAlloc = nodeArr.reduce((s, n) => s + (n.percent || 0), 0)
    if (totalAlloc >= 95 && totalAlloc <= 105) score += 20
    const overNodes = nodeArr.filter(n => ((income || 0) * (n.percent || 0) / 100) < txArr.filter(t => t.category === n.id).reduce((s, t) => s + (t.amount || 0), 0))
    score += Math.max(0, 20 - overNodes.length * 7)
    if (savingsRate >= 30) score += 35
    else if (savingsRate >= 20) score += 25
    else if (savingsRate >= 10) score += 15
    score += nodeArr.some(n => /invest|sip|mutual|stock/i.test(n.name)) ? 15 : 0
    score += txArr.length >= 5 ? 10 : (txArr.length > 0 ? 5 : 0)
    return Math.min(100, score)
  }, [nodes, transactions, income, savingsRate])

  const tierLabel = journey.profile?.tierInfo?.label || 'Explorer'
  const tierEmoji = journey.profile?.tierInfo?.emoji || '🚀'

  return (
    <div className="anim-fade">
      {/* Header */}
      <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 6, fontWeight: 500, letterSpacing: '-0.04em' }}>Protocol Overview</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Real-time capital deployment & intelligence.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/graph')} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
          <Activity size={16} style={{ color: 'var(--accent-indigo)' }} /> System Node Map
        </button>
      </div>

      {/* Top KPIs */}
      <div className="bento-grid" style={{ marginBottom: 32 }}>
        {[
          { key: 'capital', label: 'Capital Input',  value: `₹${(income || 0).toLocaleString()}`,      sub: 'Baseline influx',                      subColor: 'var(--text-muted)', desc: 'Total monthly earnings before any deductions or allocations.' },
          { key: 'outflow', label: 'System Outflow', value: `₹${(totalSpent || 0).toLocaleString()}`,  sub: `${Math.round((totalSpent / (income || 1)) * 100) || 0}% utilization`, subColor: 'var(--red)', desc: 'Total tracked expenses including needs and wants.' },
          { key: 'retention', label: 'Net Retention',  value: `₹${(totalSaved || 0).toLocaleString()}`,  sub: `${savingsRate}% efficiency`,            subColor: 'var(--green)', desc: 'Amount remaining after expenses, available for investment or emergency fund.' },
          { key: 'nodes', label: 'Active Nodes',   value: (nodes || []).length,                        sub: 'Allocation hubs',                      subColor: 'var(--text-muted)', desc: 'Number of interactive budget categories managing your cash flow.' },
        ].map(k => (
          <FeatureTooltip key={k.key} featureKey={k.key} title={k.label} description={k.desc}>
            <div className="bento-card bento-3 stat-card" style={{ height: '100%' }}>
              <div className="stat-label">{k.label}</div>
              <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>{k.value}</div>
              <div style={{ fontSize: '0.8rem', color: k.subColor, marginTop: 8 }}>{k.sub}</div>
            </div>
          </FeatureTooltip>
        ))}
      </div>

      {/* Main 2-col: Left = Journey Panel + Transactions, Right = Health + Market */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, marginBottom: 32 }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* AI Journey Panel */}
          <div className="card" style={{ background: 'var(--bg-deep)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Sparkles size={14} color="var(--accent-indigo)" />
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-indigo)', fontWeight: 600, letterSpacing: '0.08em' }}>YOUR JOURNEY</span>
                  <FeatureInfoBadge tipKey="xp-system" />
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
                  {tierEmoji} {tierLabel} — {journey.profile ? journey.profile.goalText : 'Set up your profile to begin'}
                </div>
              </div>
              {journey.streak > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.25)', borderRadius: 20 }}>
                  <Flame size={12} color="var(--yellow)" />
                  <span style={{ fontSize: '0.7rem', color: 'var(--yellow)', fontWeight: 600 }}>{journey.streak}d STREAK</span>
                </div>
              )}
            </div>

            <XPBar level={journey.level} xpInLevel={xpInLevel} levelProgress={levelProgress} />

            <div style={{ display: 'flex', gap: 16, margin: '20px 0', flexWrap: 'wrap' }}>
              {[
                { label: 'Pages Explored', value: journey.visitedPages.length },
                { label: 'Actions Done',   value: journey.completedActions.length },
                { label: 'Milestones',     value: journey.roadmapDone.length },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, minWidth: 80, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{s.value}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <NextAction journey={journey} navigate={navigate} />
          </div>

          {/* Transactions */}
          <div className="card" style={{ background: 'var(--bg-deep)' }}>
            <div className="stat-label" style={{ marginBottom: 20 }}>Recent Log Entries</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {transactions.slice(0, 5).map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 8, height: 8, background: 'var(--border-bright)', borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>{tx.title}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2, letterSpacing: '0.05em' }}>{tx.category.toUpperCase()}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>-₹{tx.amount.toLocaleString()}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{new Date(tx.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No transactions yet. Add one in <span style={{ color: 'var(--accent-indigo)', cursor: 'pointer' }} onClick={() => navigate('/graph')}>Flow Nodes</span>.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Health gauge */}
          <div className="card" style={{ background: 'var(--bg-deep)', textAlign: 'center' }}>
            <FeatureTooltip 
               featureKey="stability-index" 
               title="Stability Index" 
               description="A composite score (0-100) reflecting your current financial discipline, emergency readiness, and investment consistency."
            >
              <div className="stat-label" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'help' }}>Stability Index <Sparkles size={12} color="var(--accent-indigo)" /></div>
            </FeatureTooltip>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <HealthGauge score={healthScore} />
            </div>
            <div style={{ fontSize: '0.82rem', color: healthScore >= 75 ? 'var(--green)' : healthScore >= 50 ? 'var(--yellow)' : 'var(--red)', fontWeight: 500, marginBottom: 16 }}>
              {healthScore >= 75 ? '✓ Protocol status: OPTIMAL' : healthScore >= 50 ? '△ Recalibration suggested' : '⚠ Immediate action needed'}
            </div>
            {healthScore < 75 && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {savingsRate < 20 && 'Increase savings rate above 20%. '}
                {nodes.length < 3 && 'Add more budget categories. '}
                {!nodes.some(n => /invest/i.test(n.name)) && 'Create an investment allocation node.'}
              </div>
            )}
          </div>

          {/* Market pulse */}
          <div className="card" style={{ background: 'var(--bg-deep)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <FeatureTooltip 
                featureKey="market-pulse" 
                title="Market Pulse" 
                description="Live tracking of major Indian indices (Sensex, Nifty 50) and top individual assets to keep you aware of broader market sentiment."
              >
                <div className="stat-label" style={{ cursor: 'help' }}>Market Pulse</div>
              </FeatureTooltip>
              <button onClick={() => navigate('/markets')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                Full View <ChevronRight size={12} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { name: 'SENSEX', ...(market?.sensex || {}) },
                { name: 'NIFTY 50', ...(market?.nifty || {}) },
                ...(market?.stocks || []).slice(0, 3).map(s => ({ name: s.symbol, value: s.price, percent: s.percent }))
              ].map(item => (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, letterSpacing: '-0.01em' }}>{item.name}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{(item.value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: (item.percent || 0) >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                      {(item.percent || 0) >= 0 ? '+' : ''}{(item.percent || 0).toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="card" style={{ background: 'var(--bg-deep)' }}>
            <div className="stat-label" style={{ marginBottom: 16 }}>Achievements</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {ACHIEVEMENTS.map(a => (
                <div key={a.id} title={a.desc} style={{ opacity: a.earned ? 1 : 0.2, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{a.icon}</div>
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{a.name.split(' ')[0]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
