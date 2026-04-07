import React, { useState, useMemo } from 'react'
import { MENTORS, GOAL_MAP } from '../data/appData'
import { Star, CheckCircle, Target, Users, ShieldCheck, Zap } from 'lucide-react'

const GOALS = ['All', 'Stocks', 'Budgeting', 'Tax Saving', 'Retirement', 'Crypto', 'Real Estate', 'Debt', 'Freelancer']
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced']

function scoreMentor(mentor, goal) {
    if (!goal || goal === 'All') return mentor.rating * 20
    const goalKey = goal.toLowerCase().replace(/ /g, '_')
    const targets = GOAL_MAP[goalKey] || []
    let score = 0
    targets.forEach(t => {
        if (mentor.expertise.some(e => e.toLowerCase().includes(t.toLowerCase()))) score += 30
    })
    score += mentor.rating * 4
    score += Math.min(30, mentor.sessions / 15)
    return Math.min(100, score)
}

function Stars({ rating }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', gap: 2 }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <Star
                        key={i}
                        size={12}
                        fill={i <= Math.round(rating) ? 'var(--yellow)' : 'none'}
                        color={i <= Math.round(rating) ? 'var(--yellow)' : 'rgba(255,255,255,0.1)'}
                    />
                ))}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--yellow)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{rating}</span>
        </div>
    )
}

function BookingModal({ mentor, onClose }) {
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [booked, setBooked] = useState(false)

    if (booked) return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card modal" style={{ textAlign: 'center', maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                <div style={{
                    width: 48, height: 48, borderRadius: '50%', background: 'rgba(16,185,129,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                    color: 'var(--green)', border: '1px solid rgba(16,185,129,0.3)'
                }}>
                    <CheckCircle size={24} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 12 }}>UPLINK VERIFIED</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Engagement with <strong style={{ color: 'var(--text-primary)' }}>{mentor.name}</strong> on <strong style={{ color: 'var(--text-primary)' }}>{selectedSlot}</strong> is confirmed.</p>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', marginTop: 24, marginBottom: 24, fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    CREDENTIALS SECURELY DISPATCHED TO LOCAL CLIENT.
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>ACKNOWLEDGE</button>
            </div>
        </div>
    )

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card modal" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', border: '1px solid rgba(255,255,255,0.1)' }}>{mentor.avatar}</div>
                    <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 2 }}>{mentor.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>{mentor.title.toUpperCase()}</div>
                    </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                    <div className="input-label" style={{ marginBottom: 12 }}>Available Telemetry Windows</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {mentor.availability.map(slot => (
                            <button key={slot} onClick={() => setSelectedSlot(slot)}
                                style={{
                                    padding: '8px 16px', background: selectedSlot === slot ? 'var(--text-primary)' : 'rgba(255,255,255,0.03)',
                                    border: selectedSlot === slot ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                    color: selectedSlot === slot ? 'var(--bg-deep)' : 'var(--text-primary)',
                                    borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                                    fontFamily: 'var(--font-mono)'
                                }}>
                                {slot}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-deep)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', marginBottom: 24, fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>PROTOCOL_FEE</span>
                    <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>₹{mentor.hourlyRate}/HR</strong>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-primary" style={{ flex: 1 }} disabled={!selectedSlot} onClick={() => setBooked(true)}>
                        EXECUTE UPLINK
                    </button>
                    <button className="btn btn-secondary" onClick={onClose}>ABORT</button>
                </div>
            </div>
        </div>
    )
}

export default function Mentors() {
    const [goalFilter, setGoalFilter] = useState('All')
    const [levelFilter, setLevelFilter] = useState('All')
    const [selected, setSelected] = useState(null)
    const [expandedId, setExpandedId] = useState(null)

    const ranked = useMemo(() => {
        return [...MENTORS]
            .filter(m => levelFilter === 'All' || m.level === levelFilter.toLowerCase())
            .map(m => ({ ...m, score: scoreMentor(m, goalFilter) }))
            .sort((a, b) => b.score - a.score)
    }, [goalFilter, levelFilter])

    const top3 = ranked.slice(0, 3)

    return (
        <div className="anim-fade">
            <div style={{ marginBottom: 48 }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: 6, fontWeight: 500, letterSpacing: '-0.04em' }}>Expert Neural Net</h1>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Direct high-bandwidth consulting protocols with verified financial intelligence nodes.</p>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 32, padding: '24px 32px' }}>
                <div style={{ marginBottom: 24 }}>
                    <div className="stat-label" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Target size={14} color="var(--text-muted)" /> PRIMARY OBJECTIVE</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {GOALS.map(g => (
                            <button key={g}
                                style={{ background: goalFilter === g ? 'var(--text-primary)' : 'transparent', color: goalFilter === g ? 'var(--bg-deep)' : 'var(--text-secondary)', border: goalFilter === g ? 'none' : '1px solid rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                                onClick={() => setGoalFilter(g)}>{g.toUpperCase()}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="stat-label" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={14} color="var(--text-muted)" /> USER CLEARANCE LEVEL</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {LEVELS.map(l => (
                            <button key={l}
                                style={{ background: levelFilter === l ? 'var(--text-primary)' : 'transparent', color: levelFilter === l ? 'var(--bg-deep)' : 'var(--text-secondary)', border: levelFilter === l ? 'none' : '1px solid rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                                onClick={() => setLevelFilter(l)}>{l.toUpperCase()}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top 3 Recommendations */}
            {goalFilter !== 'All' && (
                <div style={{ marginBottom: 48 }}>
                    <div className="stat-label" style={{ marginBottom: 24, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Zap size={16} color="var(--yellow)" /> OPTIMAL ALIGNMENTS FOR: {goalFilter.toUpperCase()}
                    </div>
                    <div className="bento-grid">
                        {top3.map((m, idx) => (
                            <div key={m.id} className="bento-card bento-4" style={{
                                background: idx === 0 ? 'var(--bg-card)' : 'var(--bg-deep)',
                                border: `1px solid ${idx === 0 ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)'}`,
                                cursor: 'pointer', padding: 24, position: 'relative', overflow: 'hidden'
                            }}
                                onClick={() => setExpandedId(m.id)}
                            >
                                {idx === 0 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--accent-indigo)' }} />}
                                {idx === 0 && <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-indigo)', marginBottom: 16, letterSpacing: '0.05em' }}>SYSTEM RECOMMENDED MATCH</div>}

                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{m.avatar}</div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>{m.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.title.toUpperCase()}</div>
                                    </div>
                                </div>
                                <Stars rating={m.rating} />
                                <div style={{ marginTop: 16, fontSize: '0.75rem', padding: '6px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', display: 'inline-block', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                                    {Math.round(m.score)}% COMPATIBILITY SCORE
                                </div>
                                <button className="btn btn-primary" style={{ width: '100%', marginTop: 24, fontSize: '0.75rem' }} onClick={e => { e.stopPropagation(); setSelected(m) }}>INITIALIZE UPLINK</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Mentors Grid */}
            <div>
                <div className="stat-label" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><Users size={16} color="var(--text-muted)" /> AVAILABLE EXPERT NODES ({ranked.length})</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
                    {ranked.map(m => (
                        <div key={m.id} className="card" style={{ padding: '24px', cursor: 'pointer', background: 'var(--bg-deep)' }} onClick={() => setExpandedId(prev => prev === m.id ? null : m.id)}>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{m.avatar}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem', letterSpacing: '-0.01em' }}>{m.name}</span>
                                        {m.verified && <span style={{ fontSize: '0.6rem', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.3)', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.05em' }}>VERIFIED</span>}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: '0.05em' }}>{m.title.toUpperCase()}</div>
                                    <Stars rating={m.rating} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 600, fontSize: '1rem', fontFamily: 'var(--font-mono)' }}>₹{m.hourlyRate}<span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>/HR</span></div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{m.sessions} ENGAGEMENTS</div>
                                </div>
                            </div>

                            {expandedId === m.id && (
                                <div className="anim-slide" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 20, paddingTop: 20 }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{m.bio}</p>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                                        {m.expertise.map(e => <span key={e} style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 4, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{e.toUpperCase()}</span>)}
                                    </div>
                                    <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.75rem', padding: '10px' }} onClick={e => { e.stopPropagation(); setSelected(m) }}>REQUEST ACCESS</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {selected && <BookingModal mentor={selected} onClose={() => setSelected(null)} />}
        </div>
    )
}
