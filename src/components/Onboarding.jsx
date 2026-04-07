import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJourney } from '../context/JourneyContext'
import { Sparkles, ArrowRight, X, BarChart2, Network, PieChart, TrendingUp, Users, Newspaper } from 'lucide-react'

const STEPS = [
  {
    icon: Sparkles,
    title: 'Welcome to Finet',
    desc: "India's smartest personal finance platform. We're going to teach you everything — one step at a time. This takes 30 seconds.",
    action: null, actionLabel: 'Get Started →',
  },
  {
    icon: Network,
    title: 'Flow Nodes — Visualize Your Money',
    desc: "Your budget isn't a spreadsheet — it's a living graph. The Flow Nodes page shows every rupee you earn, broken into smart 'buckets'. Drag, resize, track spending visually.",
    action: '/graph', actionLabel: 'Explore Flow Nodes',
    skip: true,
  },
  {
    icon: BarChart2,
    title: 'Live Market Intelligence',
    desc: "Track the Sensex and Nifty 50 with professional-grade candlestick charts. See which sectors are up, which are down, and who's moving the market — updated live.",
    action: '/markets', actionLabel: 'Open Markets',
    skip: true,
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Money',
    desc: "The Equity Vault tracks your investments. Even ₹500/month in a Nifty 50 index fund, started today, becomes ₹1.4 lakh in 10 years. Small steps, massive outcomes.",
    action: '/investments', actionLabel: 'See Equity Vault',
    skip: true,
  },
  {
    icon: Sparkles,
    title: 'Meet Your AI Coach',
    desc: "Answer 5 quick questions and I'll build a **personalized financial roadmap** for your exact situation. A teen with ₹5K gets a different plan than a professional with ₹60K. That's the point.",
    action: '/coach', actionLabel: 'Build My Plan →',
    skip: false,
  },
]

export default function Onboarding() {
  const { journey, markOnboardingSeen } = useJourney()
  const navigate = useNavigate()
  const [step, setStep] = React.useState(0)

  if (journey.seenOnboarding) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const Icon = current.icon

  const handleAction = () => {
    if (isLast) {
      markOnboardingSeen()
      if (current.action) navigate(current.action)
    } else {
      setStep(s => s + 1)
    }
  }

  const skip = () => {
    markOnboardingSeen()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.4s ease',
    }}>
      <div style={{
        width: 480, background: 'var(--bg-card)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, padding: '40px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
        animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        position: 'relative',
      }}>
        {/* Skip */}
        <button onClick={skip} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
          <X size={18} />
        </button>

        {/* Step dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= step ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
          ))}
        </div>

        {/* Icon */}
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <Icon size={24} color="var(--accent-indigo)" />
        </div>

        {/* Content */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 14 }}>{current.title}</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32 }}>{current.desc}</p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleAction}
            className="btn btn-primary"
            style={{ flex: 1, padding: '12px', fontSize: '0.88rem', justifyContent: 'center' }}
          >
            {current.actionLabel}
          </button>
          {current.skip && step < STEPS.length - 1 && (
            <button onClick={() => setStep(s => s + 1)} className="btn btn-secondary" style={{ padding: '12px 20px', fontSize: '0.88rem' }}>
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
