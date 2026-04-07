import React, { useState } from 'react'
import { COMMUNITY_POSTS, CHALLENGES, ACHIEVEMENTS } from '../data/appData'
import { Users2, MessageSquare, Award, Flame, Zap, ArrowUp, Plus, History, CheckCircle2, ShieldCheck, Trophy, Edit3, Activity, Compass } from 'lucide-react'

const TAG_COLORS = { success: 'badge-green', question: 'badge-cyan', tip: 'badge-purple', discussion: 'badge-yellow' }
const TABS = ['All', 'Success Stories', 'Questions', 'Tips', 'Discussions']

export default function Community() {
    const [tab, setTab] = useState('All')
    const [votes, setVotes] = useState({})
    const [joined, setJoined] = useState({})
    const [showPost, setShowPost] = useState(false)
    const [expandedId, setExpandedId] = useState(null)

    const filtered = COMMUNITY_POSTS.filter(p => {
        if (tab === 'All') return true
        const map = { 'Success Stories': 'success', 'Questions': 'question', 'Tips': 'tip', 'Discussions': 'discussion' }
        return p.tag === map[tab]
    })

    const votePost = (id) => {
        setVotes(prev => ({ ...prev, [id]: !prev[id] }))
    }

    return (
        <div className="anim-fade">
            <div style={{ marginBottom: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: 6, fontWeight: 500, letterSpacing: '-0.04em' }}>Social Intelligence</h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Peer learning synapses and collective capital optimization.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowPost(true)} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                    <Plus size={16} style={{ marginRight: 4 }} /> TRANSMIT SIGNAL
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
                {/* Left: Posts */}
                <div>
                    {/* Tabs */}
                    <div className="tabs" style={{ marginBottom: 24 }}>
                        {TABS.map(t => (
                            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t.toUpperCase()}</button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {filtered.map(post => {
                            const voted = votes[post.id]
                            const count = post.votes + (voted ? 1 : 0)
                            return (
                                <div key={post.id} className="card" style={{ display: 'flex', gap: 16, padding: '24px', background: 'var(--bg-deep)' }}>
                                    {/* Vote button */}
                                    <button
                                        onClick={() => votePost(post.id)}
                                        style={{
                                            background: voted ? 'rgba(255,255,255,0.05)' : 'transparent',
                                            border: `1px solid ${voted ? 'var(--text-primary)' : 'rgba(255,255,255,0.1)'}`,
                                            borderRadius: 'var(--radius-sm)', width: 48, height: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8, cursor: 'pointer', flexShrink: 0,
                                            transition: 'all 0.2s', color: voted ? 'var(--text-primary)' : 'var(--text-muted)'
                                        }}>
                                        <ArrowUp size={16} style={{ marginBottom: 4 }} />
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{count}</span>
                                    </button>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                                            <span className={`badge ${TAG_COLORS[post.tag]}`}>{post.category.toUpperCase()}</span>
                                            {post.authorBadge === 'mentor' && <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>MENTOR</span>}
                                            {post.authorBadge === 'verified' && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>VERIFIED</span>}
                                        </div>

                                        <div
                                            style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: 8, cursor: 'pointer', color: 'var(--text-primary)', lineHeight: 1.4, letterSpacing: '-0.01em' }}
                                            onClick={() => setExpandedId(prev => prev === post.id ? null : post.id)}
                                        >
                                            {post.title}
                                        </div>

                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                                            {expandedId === post.id ? post.content : post.content.slice(0, 140) + (post.content.length > 140 ? '…' : '')}
                                            {post.content.length > 140 && (
                                                <button onClick={() => setExpandedId(prev => prev === post.id ? null : post.id)}
                                                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', marginLeft: 8 }}>
                                                    {expandedId === post.id ? 'Collapse ↑' : 'Expand ↓'}
                                                </button>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                            {post.tags.map(t => <span key={t} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', border: '1px solid rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>#{t.toUpperCase()}</span>)}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem' }}>{post.avatar}</div>
                                                <strong style={{ color: 'var(--text-secondary)' }}>{post.author}</strong>
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageSquare size={12} /> {post.comments} COMMENTS</span>
                                            <span>{post.time.toUpperCase()}</span>
                                            {post.hot && <span style={{ color: 'var(--yellow)', display: 'flex', alignItems: 'center', gap: 4 }}><Flame size={12} /> HOT</span>}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Right: Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Active Challenges */}
                    <div className="card">
                        <div className="section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={16} color="var(--accent-indigo)" /> ACTIVE DIRECTIVES</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {CHALLENGES.map(c => (
                                <div key={c.id} style={{ padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                        <div style={{ fontSize: '1.2rem', marginTop: 2 }}>{c.icon}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>{c.title}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>{c.participants.toLocaleString()} ENGAGED · {c.duration.toUpperCase()}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--yellow)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Trophy size={10} /> {c.reward.toUpperCase()}
                                            </div>
                                        </div>
                                        <button
                                            className={`btn btn-sm ${joined[c.id] ? 'btn-secondary' : 'btn-primary'}`}
                                            style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                                            onClick={() => setJoined(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                                        >
                                            {joined[c.id] ? 'ACTIVE' : 'JOIN'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Community stats */}
                    <div className="card">
                        <div className="section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={16} color="var(--text-muted)" /> NETWORK STATUS</div>
                        {[
                            ['NODES CONNECTED', '1,247'],
                            ['SIGNALS / WEEK', '94'],
                            ['DIRECTIVES', '4'],
                            ['MENTORS ONLINE', '12'],
                        ].map(([label, val]) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span>
                            </div>
                        ))}
                    </div>

                    {/* Achievements */}
                    <div className="card">
                        <div className="section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Award size={16} color="var(--yellow)" /> VALIDATION BADGES</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                            {ACHIEVEMENTS.map(a => (
                                <div key={a.id} style={{ opacity: a.earned ? 1 : 0.2, textAlign: 'center', padding: '8px 0' }} title={a.desc}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{a.icon}</div>
                                    <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{a.name.split(' ')[0]}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* New Post modal */}
            {showPost && (
                <div className="modal-overlay" onClick={() => setShowPost(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-title" style={{ fontSize: '1.2rem', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Edit3 size={18} /> INITIATE SIGNAL
                        </div>
                        <div className="input-group" style={{ marginBottom: 16 }}>
                            <label className="input-label">Signal Header</label>
                            <input className="input" placeholder="Define the core objective..." />
                        </div>
                        <div className="input-group" style={{ marginBottom: 16 }}>
                            <label className="input-label">Payload Data</label>
                            <textarea className="input" rows={5} placeholder="Transmit your analysis, queries, or tactical insights..." style={{ resize: 'vertical' }} />
                        </div>
                        <div className="input-group" style={{ marginBottom: 24 }}>
                            <label className="input-label">Classification Tag</label>
                            <select className="input">
                                <option>Query</option>
                                <option>Tactical Success</option>
                                <option>Intelligence Tip</option>
                                <option>Open Discussion</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setShowPost(false)}>TRANSMIT</button>
                            <button className="btn btn-secondary" onClick={() => setShowPost(false)}>ABORT</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
