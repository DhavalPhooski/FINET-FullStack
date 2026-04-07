import React, { createContext, useContext, useState, useEffect } from 'react'
import { X, Info } from 'lucide-react'

// ─── Feature tip definitions per section ─────────────────────────────────────
export const FEATURE_TIPS = {
  // Dashboard
  'stability-index': {
    title: 'Stability Index',
    body: 'A 0–100 score that rates your financial health. It rewards positive savings rate, staying within budget nodes, and having an investment allocation. Aim for 75+.',
    emoji: '🎯',
  },
  'flow-nodes': {
    title: 'Flow Nodes Graph',
    body: 'A visual, interactive representation of your budget. Each bubble ("node") is a money category. Drag to rearrange. Click to log spending. The arc fills as you spend from that bucket.',
    emoji: '🕸',
  },
  'allocations': {
    title: 'Budget Allocations',
    body: 'Based on the 50-30-20 rule — 50% for needs (rent, food), 30% for wants (entertainment), 20% for savings & investment. You can customise the percentages.',
    emoji: '🥧',
  },
  'equity-vault': {
    title: 'Equity Vault',
    body: 'Your investment tracker. Add SIPs, stocks, mutual funds. Tracks total invested vs current value and shows ROI%. XIRR gives your true annualised return.',
    emoji: '📈',
  },
  'liability': {
    title: 'Liability Manager',
    body: 'Track all your loans (education, home, personal). Shows remaining principal, EMI, and progress. Use debt avalanche: attack the highest-interest loan first.',
    emoji: '🏦',
  },
  'ai-coach': {
    title: 'AI Financial Coach',
    body: 'Answer 5 questions and get a personalised financial roadmap powered by Gemini AI. The AI adapts its advice to your age, capital, experience and goals.',
    emoji: '🤖',
  },
  'intel-stream': {
    title: 'Intelligence Stream',
    body: 'Real financial news fetched from NewsAPI & Alpha Vantage, plus web scraping of Moneycontrol. Filter by category (Stocks, Tax, RBI) or complexity level.',
    emoji: '📰',
  },
  'expert-network': {
    title: 'Expert Network',
    body: 'SEBI-registered financial advisors and certified coaches. Filter by your goal. AI matches you to the best expert. Book a 1-on-1 session directly.',
    emoji: '👥',
  },
  'community': {
    title: 'Community Hub',
    body: 'A space where Indian investors share journeys. Upvote helpful posts, join financial challenges, and earn achievement badges for milestones.',
    emoji: '🌐',
  },
  'xp-system': {
    title: 'XP & Levels',
    body: 'Every action earns XP — visiting pages (5 XP), logging transactions (15 XP), completing roadmap milestones (30 XP). Level up to unlock new insights.',
    emoji: '⚡',
  },
  'market-pulse': {
    title: 'Market Pulse',
    body: 'Live Sensex & Nifty data pulled via Alpha Vantage API. Green = up, Red = down. You don\'t need to react to daily moves — use it for awareness.',
    emoji: '📊',
  },
}

// ─── Context ──────────────────────────────────────────────────────────────────
const TipContext = createContext(null)

export function FeatureTipProvider({ children }) {
  const [activeTip, setActiveTip] = useState(null)  // key from FEATURE_TIPS
  const [seenTips, setSeenTips] = useState(() => {
    try { return JSON.parse(localStorage.getItem('finet:seen_tips') || '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('finet:seen_tips', JSON.stringify(seenTips))
  }, [seenTips])

  const showTip = (key) => setActiveTip(key)
  const dismissTip = () => {
    if (activeTip) setSeenTips(s => s.includes(activeTip) ? s : [...s, activeTip])
    setActiveTip(null)
  }
  const hasSeenTip = (key) => seenTips.includes(key)

  return (
    <TipContext.Provider value={{ showTip, dismissTip, hasSeenTip }}>
      {children}
      {activeTip && <TipModal tipKey={activeTip} onClose={dismissTip} />}
    </TipContext.Provider>
  )
}

export function useTip() {
  return useContext(TipContext)
}

// ─── Tip modal ────────────────────────────────────────────────────────────────
function TipModal({ tipKey, onClose }) {
  const tip = FEATURE_TIPS[tipKey]
  if (!tip) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1500,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 420, background: 'var(--bg-card)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
        padding: '32px', position: 'relative',
        boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
        animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
          <X size={16} />
        </button>
        <div style={{ fontSize: '2rem', marginBottom: 16 }}>{tip.emoji}</div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 12 }}>{tip.title}</h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{tip.body}</p>
        <button onClick={onClose} className="btn btn-primary" style={{ marginTop: 24, width: '100%', fontSize: '0.82rem', justifyContent: 'center' }}>
          Got it ✓
        </button>
      </div>
    </div>
  )
}

// ─── Info badge — attach next to any feature heading ─────────────────────────
// Usage: <FeatureInfoBadge tipKey="stability-index" />
export function FeatureInfoBadge({ tipKey, style }) {
  const { showTip } = useTip()
  return (
    <button
      onClick={() => showTip(tipKey)}
      title="What is this?"
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 18, height: 18, borderRadius: '50%',
        color: 'var(--text-muted)', transition: 'color 0.15s',
        verticalAlign: 'middle', padding: 0, ...style,
      }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-indigo)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
    >
      <Info size={14} />
    </button>
  )
}

// ─── Auto-popup on first visit for a section ─────────────────────────────────
// Usage: useAutoTip('stability-index') inside a component
export function useAutoTip(tipKey) {
  const ctx = useContext(TipContext)
  useEffect(() => {
    if (ctx && !ctx.hasSeenTip(tipKey)) {
      const t = setTimeout(() => ctx.showTip(tipKey), 1200)
      return () => clearTimeout(t)
    }
  }, [])
}
