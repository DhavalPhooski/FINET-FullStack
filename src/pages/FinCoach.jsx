import React, { useState, useRef, useEffect } from 'react'
import { buildProfile } from '../utils/coachEngine'
import { useJourney } from '../context/JourneyContext'
import { FeatureInfoBadge } from '../components/FeatureTips'
import { Sparkles, ArrowRight, CheckCircle2, Circle, Send, ChevronDown, RotateCcw, User, BookOpen } from 'lucide-react'

import api from '../utils/api'

const QUIZ = [
  { id: 'age',        question: "First — how old are you?",                   subtext: "We tailor everything to your stage of life.",                        type: 'number', placeholder: 'e.g. 19',    unit: 'years old' },
  { id: 'capital',    question: "How much capital do you have right now?",     subtext: "Savings, pocket money — whatever you can allocate.",                 type: 'number', placeholder: 'e.g. 5000',  unit: '₹ available' },
  { id: 'income',     question: "Monthly income or allowance?",               subtext: "Approximate is fine. Type 0 if you're a student.",                   type: 'number', placeholder: 'e.g. 20000', unit: '₹ / month' },
  { id: 'experience', question: "What's your investing experience?",          subtext: "Be honest — this helps us give the right advice.",                   type: 'choice', options: [
    { value: 'never',    label: 'Never invested',  sub: "Completely new" },
    { value: 'heard',    label: 'Heard about it',  sub: "Know terms, never acted" },
    { value: 'sip',      label: 'Have a SIP',      sub: "Running 1–2 mutual funds" },
    { value: 'some',     label: 'Some portfolio',  sub: "Stocks, MFs, maybe more" },
    { value: 'advanced', label: 'Active investor', sub: "Tracks markets regularly" },
  ]},
  { id: 'goal', question: "Primary money goal?", subtext: "We'll build your entire roadmap around this.", type: 'choice', options: [
    { value: 'grow',    label: 'Grow my money',     sub: "Make it multiply" },
    { value: 'save',    label: 'Build savings',      sub: "Create a safety net" },
    { value: 'invest',  label: 'Start investing',    sub: "Right places for money" },
    { value: 'debt',    label: 'Clear debt',         sub: "Pay off while building" },
    { value: 'retire',  label: 'Long-term wealth',   sub: "Retirement corpus" },
  ]},
]

function MD({ text }) {
  if (!text) return null
  return (
    <span style={{ lineHeight: 1.7 }}>
      {text.split(/(\*\*.*?\*\*)/g).map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.slice(2,-2)}</strong>
          : p
      )}
    </span>
  )
}

function RoadmapCard({ step, index, onToggle }) {
  const [expanded, setExpanded] = useState(index === 0)
  return (
    <div style={{ border: `1px solid ${step.done ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 'var(--radius-sm)', background: step.done ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.02)', transition: 'all 0.25s' }}>
      <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <button onClick={e => { e.stopPropagation(); onToggle(step.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, color: step.done ? 'var(--green)' : 'var(--text-muted)' }}>
          {step.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Phase: {step.phase}</div>
          <div style={{ fontWeight: 600, fontSize: '0.92rem', color: step.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: step.done ? 'line-through' : 'none' }}>{step.title}</div>
        </div>
        <ChevronDown size={15} color="var(--text-muted)" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </div>
      {expanded && (
        <div className="anim-slide" style={{ padding: '0 22px 18px 56px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>{step.desc}</p>
          <div style={{ padding: '10px 14px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--accent-indigo)', fontWeight: 500 }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Action Item</span>
            {step.action}
          </div>
        </div>
      )}
    </div>
  )
}

export default function FinCoach() {
  const [step, setStep]           = useState(0)
  const [answers, setAnswers]     = useState({})
  const [currentVal, setCurrentVal] = useState('')
  const [profile, setProfileLocal] = useState(null)
  const [roadmap, setRoadmap]     = useState([])
  const [msgs, setMsgs]           = useState([])
  const [input, setInput]         = useState('')
  const [typing, setTyping]       = useState(false)
  const [apiOnline, setApiOnline] = useState(false)
  const [resources, setResources] = useState([])
  const chatEndRef = useRef(null)
  const { setProfile: saveToJourney, completeRoadmapStep, resetJourney, journey } = useJourney()

  useEffect(() => {
    api.get('/health').then(r => r.status === 200 && setApiOnline(true)).catch(() => {})
    // Fetch personalized learning nodes
    api.get('/roadmap/resources').then(r => setResources(r.data.resources)).catch(e => console.error('Resources failed', e))
  }, [])

  // Restore saved profile
  useEffect(() => {
    if (journey.profile && !profile) {
      setProfileLocal(journey.profile)
      setRoadmap(journey.profile.roadmap.map(r => ({ ...r, done: journey.roadmapDone.includes(r.id) })))
      setMsgs([{ role: 'coach', content: `Welcome back, **${journey.profile.tierInfo.label}**! ${apiOnline ? 'Gemini AI is ready.' : 'Ask me anything.'} Your roadmap is below.` }])
    }
  }, [journey.profile])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, typing])

  const finishQuiz = (newAnswers) => {
    const p = buildProfile(newAnswers)
    setProfileLocal(p)
    saveToJourney(p)
    setRoadmap(p.roadmap.map(r => ({ ...r })))
    setMsgs([{ role: 'coach', content: `${p.tierInfo.emoji} **Welcome, ${p.tierInfo.label}.** Profile locked in.\n\n${p.capitalContext}\n\nMission: **${p.goalText}**. Your roadmap is live — start Step 1. Ask me anything.` }])
  }

  const handleNext = () => {
    const q = QUIZ[step]
    if (!currentVal && q.type === 'number') return
    const na = { ...answers, [q.id]: currentVal }
    setAnswers(na); setCurrentVal('')
    if (step === QUIZ.length - 1) finishQuiz(na)
    else setStep(s => s + 1)
  }

  const handleChoice = (val) => {
    const na = { ...answers, [QUIZ[step].id]: val }
    setAnswers(na); setCurrentVal('')
    setTimeout(() => {
      if (step === QUIZ.length - 1) finishQuiz(na)
      else setStep(s => s + 1)
    }, 150)
  }

  const send = async (overrideMsg) => {
    const text = (overrideMsg ?? input).trim()
    if (!text) return
    setMsgs(m => [...m, { role: 'user', content: text }])
    setInput('')
    setTyping(true)
    try {
      let replied = false
      if (apiOnline) {
        try {
          const res = await api.post('/chat', {
            message: text, 
            profile: profile || {}, 
            history: msgs.slice(-8) 
          })
          if (res.data?.reply) {
            setMsgs(m => [...m, { role: 'coach', content: res.data.reply }])
            replied = true
          }
        } catch (apiErr) {
          console.warn('[Coach] API call failed, using local engine', apiErr)
        }
      }
      if (!replied) {
        const { getCoachResponse } = await import('../utils/coachEngine')
        setMsgs(m => [...m, { role: 'coach', content: getCoachResponse(text, profile) }])
      }
    } catch { setMsgs(m => [...m, { role: 'coach', content: 'Something went wrong. Please try again.' }]) }
    finally { setTyping(false) }
  }

  const toggleDone = (id) => {
    setRoadmap(r => r.map(s => s.id === id ? { ...s, done: !s.done } : s))
    completeRoadmapStep(id)
  }

  const reset = () => {
    setStep(0); setAnswers({}); setCurrentVal(''); setProfileLocal(null); setRoadmap([]); setMsgs([])
    resetJourney()
  }

  const done = roadmap.filter(r => r.done).length
  const q = QUIZ[step]

  // ── QUIZ ──────────────────────────────────────────────────────────────────
  if (!profile) {
    return (
      <div className="anim-fade" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 540 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 18, padding: '5px 14px', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 40, background: 'rgba(99,102,241,0.08)' }}>
              <Sparkles size={13} color="var(--accent-indigo)" />
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-indigo)', fontWeight: 600, letterSpacing: '0.05em' }}>AI FINANCIAL COACH</span>
              <FeatureInfoBadge tipKey="ai-coach" />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 500, letterSpacing: '-0.04em', marginBottom: 8 }}>Let's build your money plan.</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              5 questions · {apiOnline ? '🟢 Gemini AI ready' : '🟡 Offline mode'}
            </p>
          </div>

          {/* Progress bar */}
          <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginBottom: 40, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(step / QUIZ.length) * 100}%`, background: 'var(--accent-indigo)', transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 0 12px rgba(99,102,241,0.5)' }} />
          </div>

          <div className="card" style={{ padding: '36px', background: 'var(--bg-card)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 14, fontWeight: 600 }}>QUESTION {step+1} OF {QUIZ.length}</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 500, letterSpacing: '-0.03em', marginBottom: 8, lineHeight: 1.3 }}>{q.question}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 28 }}>{q.subtext}</p>

            {q.type === 'number' && (
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  {(q.id === 'capital' || q.id === 'income') && (
                    <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, pointerEvents: 'none' }}>₹</span>
                  )}
                  <input autoFocus type="number" className="input" placeholder={q.placeholder} value={currentVal}
                    onChange={e => setCurrentVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleNext()}
                    style={{ fontSize: '1.05rem', padding: `14px 18px 14px ${(q.id === 'capital' || q.id === 'income') ? '32px' : '18px'}`, height: 'auto' }} />
                  <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{q.unit}</span>
                </div>
                <button className="btn btn-primary" onClick={handleNext} style={{ padding: '12px 22px' }}><ArrowRight size={18} /></button>
              </div>
            )}
            {q.type === 'choice' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {q.options.map(opt => (
                  <button key={opt.value} onClick={() => handleChoice(opt.value)} style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 'var(--radius-sm)', padding: '14px 18px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.background = 'rgba(99,102,241,0.06)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 1 }}>{opt.label}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{opt.sub}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── COACH VIEW ─────────────────────────────────────────────────────────────
  return (
    <div className="anim-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '4px 12px', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 40, background: 'rgba(99,102,241,0.08)' }}>
            <Sparkles size={12} color="var(--accent-indigo)" />
            <span style={{ fontSize: '0.68rem', color: 'var(--accent-indigo)', fontWeight: 600, letterSpacing: '0.05em' }}>{profile.tierInfo.emoji} {profile.tierInfo.label.toUpperCase()}</span>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: apiOnline ? 'var(--green)' : 'var(--yellow)', marginLeft: 4 }} title={apiOnline ? 'Gemini AI online' : 'Offline mode'} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 500, letterSpacing: '-0.04em', marginBottom: 4 }}>Your Financial Roadmap</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{profile.goalText.charAt(0).toUpperCase() + profile.goalText.slice(1)} — personalised for you.</p>
        </div>
        <button className="btn btn-secondary" onClick={reset} style={{ fontSize: '0.73rem', gap: 8 }}>
          <RotateCcw size={13} /> Reset Profile
        </button>
      </div>

      {/* Milestone progress */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>MILESTONES COMPLETED</span>
          <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>{done} / {roadmap.length}</span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
          <div style={{ height: '100%', width: `${roadmap.length ? (done/roadmap.length)*100 : 0}%`, background: 'linear-gradient(to right, var(--accent-indigo), var(--accent-purple))', transition: 'width 0.4s', borderRadius: 4 }} />
        </div>
      </div>

      {/* Two-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24, alignItems: 'start' }}>
        {/* Roadmap */}
        <div>
          <div className="section-title" style={{ marginBottom: 14 }}>Action Roadmap</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* 1. The Dynamic Next Move Card */}
            <div className="card" style={{ 
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', 
              border: '1px solid rgba(99,102,241,0.3)', marginBottom: 16, padding: '20px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={14} color="#fff" />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-indigo)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Next Intelligence Move</div>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>{journey.nextCognitiveStep || "Analyze your 'Spending Node' for potential SIP influx."}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>Based on your level {journey.level} status and recent market pulse headlines.</div>
              <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.75rem' }}>Execute Prediction</button>
            </div>

            {roadmap.map((s, i) => <RoadmapCard key={s.id} step={s} index={i} onToggle={toggleDone} />)}

            {/* 2. Personalized Learning Resources */}
            <div className="section-title" style={{ marginTop: 24, marginBottom: 14, fontSize: '0.7rem', opacity: 0.6 }}>Cognitive Resources</div>
            {resources?.length > 0 ? resources.map((res, i) => (
              <div key={i} className="card" style={{ 
                background: 'var(--bg-deep)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, 
                border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' 
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {res.type === 'Course' ? <Send size={14} color="var(--accent-indigo)" /> : <BookOpen size={14} color="var(--text-muted)" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>{res.type} · +{res.xp} XP</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{res.title}</div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </div>
            )) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Loading tailored resources...</div>
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div style={{ position: 'sticky', top: 24, height: 'calc(100vh - 130px)', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(99,102,241,0.05)' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} color="var(--accent-indigo)" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Finet Coach</div>
              <div style={{ fontSize: '0.68rem', color: apiOnline ? 'var(--green)' : 'var(--yellow)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: apiOnline ? 'var(--green)' : 'var(--yellow)' }} />
                {apiOnline ? 'Gemini AI · Personalised' : 'Offline mode · Rule-based'}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {msgs.map((msg, i) => {
              const isUser = msg.role === 'user'
              return (
                <div key={i} style={{ display: 'flex', gap: 10, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                  {!isUser && <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Sparkles size={12} color="var(--accent-indigo)" /></div>}
                  <div style={{ maxWidth: '78%', padding: '11px 15px', background: isUser ? 'var(--text-primary)' : 'rgba(255,255,255,0.04)', border: isUser ? 'none' : '1px solid rgba(255,255,255,0.07)', borderRadius: isUser ? '15px 15px 4px 15px' : '4px 15px 15px 15px', color: isUser ? '#000' : 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.65 }}>
                    {isUser ? msg.content : <MD text={msg.content} />}
                  </div>
                  {isUser && <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><User size={13} color="var(--text-primary)" /></div>}
                </div>
              )
            })}
            {typing && (
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Sparkles size={12} color="var(--accent-indigo)" /></div>
                <div style={{ padding: '11px 15px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px 15px 15px 15px', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-muted)', animation: `bounce 1.2s ease-in-out ${i*0.15}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick prompts */}
          <div style={{ padding: '6px 14px', display: 'flex', gap: 5, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {['What is a SIP?', 'How to start investing?', 'Is crypto safe?', 'What should I do next?'].map(q => (
              <button key={q} onClick={() => send(q)} style={{ fontSize: '0.67rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '3px 9px', borderRadius: 20, cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', whiteSpace: 'nowrap' }}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
            <input className="input" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask anything about money…"
              style={{ flex: 1, fontSize: '0.83rem', padding: '9px 13px' }} />
            <button onClick={() => send()} style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent-indigo)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Send size={14} color="#fff" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
