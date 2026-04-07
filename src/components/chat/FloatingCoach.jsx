import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useJourney } from '../../context/JourneyContext'
import { Sparkles, X, Send, ChevronRight } from 'lucide-react'
import { getCoachResponse } from '../../utils/coachEngine'
import api from '../../utils/api'

// ── Page-aware context tips ─────────────────────────────────────────────────
const PAGE_TIPS = {
  '/':            { title: 'Overview',          hint: 'Command centre — see your income, spending, savings, health score and journey XP.' },
  '/graph':       { title: 'Flow Nodes',        hint: 'Visual D3 budget graph. Each node is a money bucket. Drag, resize, and click to log transactions.' },
  '/budget':      { title: 'Allocations',       hint: '50-30-20 rule: Needs 50%, Wants 30%, Invest 20%. Adjust percentages to fit your life.' },
  '/investments': { title: 'Equity Vault',      hint: 'Track your SIPs and stocks. XIRR shows true annualised returns accounting for your SIP timing.' },
  '/loans':       { title: 'Liabilities',       hint: 'Manage all debts. Use debt avalanche: pay minimums on all, attack the highest-rate loan first.' },
  '/mentors':     { title: 'Expert Network',    hint: 'SEBI-registered advisors matched to your goal. One session can save years of costly mistakes.' },
  '/news':        { title: 'Intelligence',      hint: 'Real financial news from NewsAPI & Alpha Vantage. Filter by complexity level.' },
  '/community':   { title: 'Community Hub',     hint: 'Real users sharing real journeys. Post questions — the community answers within hours.' },
  '/coach':       { title: 'AI Coach',          hint: 'Your personalised financial roadmap. Powered by Gemini AI. Complete the quiz to unlock it.' },
}

function SimpleMarkdown({ text }) {
  if (!text) return null
  return (
    <span style={{ lineHeight: 1.7 }}>
      {text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
          : part
      )}
    </span>
  )
}

export default function FloatingCoach() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [pulse, setPulse] = useState(false)
  const [apiOnline, setApiOnline] = useState(false)
  const chatEndRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { journey, trackAction } = useJourney()

  const tier = journey.profile?.tier
  const pageTip = PAGE_TIPS[location.pathname]

  // Check if API is up (re-check each time panel opens)
  useEffect(() => {
    if (open) {
      api.get('/health')
        .then(r => r.status === 200 && setApiOnline(true))
        .catch(() => setApiOnline(false))
    }
  }, [open])

  // Auto-greet when coach opens
  useEffect(() => {
    if (!open || msgs.length > 0) return
    const greeting = journey.profile
      ? `${journey.profile.tierInfo.emoji} Welcome back, **${journey.profile.tierInfo.label}**!\n\nYou're on **${pageTip?.title || 'a new page'}** — ${pageTip?.hint || ''}\n\nAsk me anything, or try: *"What should I do next?"*`
      : `Hi! I'm **Finet Coach** — powered by Gemini AI 🤖\n\nI explain every financial concept, guide you through Finet, and build your personalised plan.\n\nStart by typing a question or open the **AI Coach** page to set up your full profile.`
    setMsgs([{ role: 'coach', content: greeting }])
  }, [open])

  // Pulse when page changes
  useEffect(() => {
    if (!open) { setPulse(true); setTimeout(() => setPulse(false), 3000) }
  }, [location.pathname])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, typing])

  const send = useCallback(async (overrideMsg) => {
    const text = (overrideMsg ?? input).trim()
    if (!text) return
    setMsgs(m => [...m, { role: 'user', content: text }])
    setInput('')
    setTyping(true)
    trackAction('used_coach_chat')

    try {
      let replied = false
      if (apiOnline) {
        try {
          const res = await api.post('/chat', {
            message: text,
            profile: journey.profile || {},
            history: msgs.slice(-6),
          })
          if (res.data?.reply) {
            setMsgs(m => [...m, { role: 'coach', content: res.data.reply }])
            replied = true
          }
        } catch (apiErr) {
          console.warn('[Coach] API call failed, falling back to local engine', apiErr)
        }
      }
      if (!replied) {
        // Smart offline fallback using coachEngine
        const reply = getCoachResponse(text, journey.profile)
        setMsgs(m => [...m, { role: 'coach', content: reply }])
      }
    } catch (e) {
      setMsgs(m => [...m, { role: 'coach', content: 'Something went wrong. Please try again.' }])
    } finally {
      setTyping(false)
    }
  }, [input, msgs, journey, apiOnline, pageTip, trackAction])

  const QUICK = ['What is a SIP?', 'How to start investing?', 'Is crypto safe?', 'What should I do next?']

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(s => !s)}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
          width: 52, height: 52, borderRadius: '50%',
          background: open ? 'var(--accent-indigo)' : 'var(--bg-card)',
          border: `1.5px solid ${open ? 'var(--accent-indigo)' : pulse ? 'rgba(99,102,241,0.6)' : 'var(--border)'}`,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: open ? '0 0 24px rgba(99,102,241,0.5)' : pulse ? '0 0 20px rgba(99,102,241,0.25)' : '0 4px 20px rgba(0,0,0,0.4)',
        }}
        title="Finet AI Coach"
      >
        {open ? <X size={20} color="#fff" /> : <Sparkles size={20} color={pulse ? '#818cf8' : 'var(--text-primary)'} />}
      </button>
      {pulse && !open && (
        <div style={{ position: 'fixed', bottom: 22, right: 22, zIndex: 999, width: 64, height: 64, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.35)', animation: 'pulse-ring 1.5s ease-out forwards', pointerEvents: 'none' }} />
      )}

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 92, right: 28, zIndex: 999,
          width: 440, maxWidth: 'calc(100vw - 56px)', height: 620, maxHeight: 'calc(100vh - 120px)',
          background: 'var(--bg-card)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(99,102,241,0.06)' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={17} color="var(--accent-indigo)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Finet Coach</div>
              <div style={{ fontSize: '0.72rem', color: apiOnline ? 'var(--green)' : 'var(--yellow)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: apiOnline ? 'var(--green)' : 'var(--yellow)' }} />
                {apiOnline ? `Gemini AI · ${pageTip?.title || 'Active'}` : 'Smart Coach · Offline'}
              </div>
            </div>
            <button onClick={() => { navigate('/coach'); setOpen(false) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--accent-indigo)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
              Full <ChevronRight size={12} />
            </button>
          </div>

          {/* XP bar */}
          <div style={{ padding: '8px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>LVL {journey.level}</span>
            <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${journey.xp % 100}%`, background: 'linear-gradient(90deg, var(--accent-indigo), var(--accent-purple))', borderRadius: 2, transition: 'width 0.6s' }} />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{journey.xp % 100}/100 XP</span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {msgs.map((msg, i) => {
              const isUser = msg.role === 'user'
              return (
                <div key={i} style={{ display: 'flex', gap: 10, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                  {!isUser && <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}><Sparkles size={13} color="var(--accent-indigo)" /></div>}
                  <div style={{ maxWidth: '82%', padding: '11px 15px', background: isUser ? 'var(--text-primary)' : 'rgba(255,255,255,0.04)', border: isUser ? 'none' : '1px solid rgba(255,255,255,0.06)', borderRadius: isUser ? '14px 14px 4px 14px' : '4px 14px 14px 14px', color: isUser ? '#000' : 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                    {isUser ? msg.content : <SimpleMarkdown text={msg.content} />}
                  </div>
                </div>
              )
            })}
            {typing && (
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Sparkles size={13} color="var(--accent-indigo)" /></div>
                <div style={{ padding: '11px 15px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px 14px 14px 14px', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', animation: `bounce 1.2s ease-in-out ${i*0.15}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick prompts */}
          <div style={{ padding: '8px 14px', display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            {QUICK.map(q => (
              <button key={q} onClick={() => send(q)}
                style={{ fontSize: '0.73rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '5px 12px', borderRadius: 20, cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'var(--font-main)', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10 }}>
            <input className="input" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask anything about money…"
              style={{ flex: 1, fontSize: '0.9rem', padding: '10px 14px' }} />
            <button onClick={() => send()} style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-indigo)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.1s' }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
              <Send size={15} color="#fff" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
