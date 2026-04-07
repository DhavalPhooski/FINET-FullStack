import React, { useContext } from 'react'
import { AppContext } from '../App'
import { useNavigate } from 'react-router-dom'
import { PieChart, CheckCircle, AlertTriangle, ArrowUpRight, Activity } from 'lucide-react'

export default function Budget() {
    const { income, nodes, transactions } = useContext(AppContext)
    const navigate = useNavigate()

    const totalAlloc = (nodes || []).reduce((s, n) => s + (n.percent || 0), 0)

    return (
        <div className="anim-fade">
            <div style={{ marginBottom: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: 6, fontWeight: 500, letterSpacing: '-0.04em' }}>Allocations Intelligence</h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Detailed breakdown of capital distribution across system nodes.</p>
                </div>
            </div>

            <div className="bento-grid" style={{ marginBottom: 32 }}>
                <div className="bento-card bento-4" style={{ padding: 32 }}>
                    <div className="stat-label">Monthly Influx</div>
                    <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>₹{income.toLocaleString()}</div>
                </div>
                <div className="bento-card bento-4" style={{ padding: 32 }}>
                    <div className="stat-label">System Saturation</div>
                    <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>{totalAlloc}%</div>
                    <div style={{ fontSize: '0.75rem', marginTop: 8, color: totalAlloc === 100 ? 'var(--green)' : 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>
                        {totalAlloc === 100 ? 'STATUS: OPTIMAL' : 'RECALIBRATION REQUIRED'}
                    </div>
                </div>
                <div className="bento-card bento-4" style={{ padding: 32 }}>
                    <div className="stat-label">Active Nodes</div>
                    <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>{nodes.length}</div>
                </div>
            </div>

            {/* Per-node breakdown table */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="flex-between" style={{ marginBottom: 24 }}>
                    <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Activity size={16} color="var(--text-muted)" /> Category Breakdown
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate('/graph')} style={{ padding: '6px 14px', fontSize: '0.75rem' }}>Edit in Graph <ArrowUpRight size={14} /></button>
                </div>
                {nodes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                        <PieChart size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 16 }} />
                        <div style={{ fontWeight: 500, letterSpacing: '-0.02em', fontSize: '1.1rem' }}>No intelligence nodes detected.</div>
                        <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => navigate('/graph')}>Initialize System</button>
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr', gap: 16, fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 12 }}>
                            <span>Protocol</span><span>Alloc %</span><span>Capital</span><span>Consumed</span><span>Execution</span>
                        </div>
                        {nodes.map((n, i) => {
                            const allocated = income * (n.percent / 100)
                            const spent = transactions.filter(t => t.category === n.id).reduce((s, t) => s + t.amount, 0)
                            const ratio = allocated > 0 ? spent / allocated : 0
                            const col = ratio >= 0.95 ? 'red' : ratio >= 0.75 ? 'yellow' : 'green'
                            return (
                                <div key={n.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr', gap: 16, alignItems: 'center', padding: '16px 0', borderBottom: i !== nodes.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.color, flexShrink: 0, filter: `drop-shadow(0 0 6px ${n.color})` }} />
                                        <span style={{ fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>{n.name}</span>
                                    </div>
                                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{n.percent}%</span>
                                    <span style={{ fontWeight: 500, fontFamily: 'var(--font-mono)' }}>₹{Math.round(allocated).toLocaleString()}</span>
                                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>₹{spent.toLocaleString()}</span>
                                    <div className="progress-track" style={{ height: 4, background: 'rgba(255,255,255,0.05)' }}>
                                        <div className={`progress-fill ${col}`} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="card-accent" style={{ background: 'var(--bg-deep)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-primary)', marginBottom: 24 }}>STANDARD ARCHITECTURE (50/30/20)</div>
                <div className="bento-grid">
                    {[['50%', 'Base Protocol', `₹${Math.round(income * 0.5).toLocaleString()}`, 'Essential overhead & operations'],
                    ['30%', 'Flex Channel', `₹${Math.round(income * 0.3).toLocaleString()}`, 'Discretionary capital flow'],
                    ['20%', 'Retention', `₹${Math.round(income * 0.2).toLocaleString()}`, 'Wealth preservation & scaling'],
                    ].map(([pct, label, amount, desc]) => (
                        <div key={label} className="bento-card bento-4" style={{ textAlign: 'center', padding: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 500, fontFamily: 'var(--font-mono)', marginBottom: 8, color: 'var(--text-primary)', letterSpacing: '-0.05em' }}>{pct}</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase' }}>{label}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 500, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{amount}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 12 }}>{desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
