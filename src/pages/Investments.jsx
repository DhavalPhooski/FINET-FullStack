import React, { useContext, useState } from 'react'
import { AppContext } from '../App'
import { TrendingUp, Plus, Activity, Briefcase, Zap } from 'lucide-react'
import api from '../utils/api'

export default function Investments() {
    const { portfolio, setPortfolio, income } = useContext(AppContext)
    const [showAdd, setShowAdd] = useState(false)
    const [form, setForm] = useState({ name: '', type: 'Index Fund', invested: '', value: '' })

    const totalInvested = portfolio.reduce((s, p) => s + p.invested, 0)
    const totalValue = portfolio.reduce((s, p) => s + p.value, 0)
    const totalROI = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0

    const addPortfolio = async () => {
        if (!form.name || !form.invested || !form.value) return
        const inv = Number(form.invested), val = Number(form.value)
        
        try {
            await api.post('/user/portfolio', {
                name: form.name,
                type: form.type,
                invested: inv,
                current_value: val,
                color: ['#8b5cf6', '#10b981', '#22d3ee', '#f59e0b', '#f43f5e'][Math.floor(Math.random() * 5)]
            })
            // Refresh data
            const res = await api.get('/user/data')
            setPortfolio(res.data.portfolio || [])
            setForm({ name: '', type: 'Index Fund', invested: '', value: '' })
            setShowAdd(false)
        } catch (err) {
            console.error('Failed to add portfolio item', err)
        }
    }

    return (
        <div className="anim-fade">
            <div className="flex-between" style={{ marginBottom: 48, alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: 6, fontWeight: 500, letterSpacing: '-0.04em' }}>Equity Holdings</h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Real-time portfolio performance tracking and valuation.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                    <Plus size={16} style={{ marginRight: 4 }} /> ADD ASSET
                </button>
            </div>

            {/* Summary stats */}
            <div className="bento-grid" style={{ marginBottom: 32 }}>
                <div className="bento-card bento-4" style={{ padding: 24 }}>
                    <div className="stat-label">Total Invested</div>
                    <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>₹{totalInvested.toLocaleString('en-IN')}</div>
                </div>
                <div className="bento-card bento-4" style={{ padding: 24, border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div className="stat-label">Current Value</div>
                    <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>₹{totalValue.toLocaleString('en-IN')}</div>
                </div>
                <div className="bento-card bento-4" style={{ padding: 24, background: 'rgba(255,255,255,0.02)' }}>
                    <div className="stat-label">Overall Return</div>
                    <div className="stat-value" style={{ fontFamily: 'var(--font-mono)', color: totalROI >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {totalROI >= 0 ? '+' : ''}{totalROI.toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.75rem', marginTop: 8, color: 'var(--text-secondary)' }}>Gain: ₹{(totalValue - totalInvested).toLocaleString('en-IN')}</div>
                </div>
            </div>

            {/* Portfolio list */}
            <div className="card">
                <div className="section-title" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Briefcase size={16} color="var(--text-muted)" /> Portfolio Holdings
                </div>
                {portfolio.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                        <Activity size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 16 }} />
                        <div style={{ fontWeight: 500, letterSpacing: '-0.02em', fontSize: '1.1rem' }}>No equity data detected.</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {portfolio.map(p => {
                            const roi = p.invested > 0 ? ((p.value - p.invested) / p.invested) * 100 : 0
                            const gain = p.value - p.invested
                            return (
                                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-deep)' }}>
                                    <div style={{ width: 4, height: 24, background: p.color, borderRadius: 2 }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{p.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 2 }}>{p.type}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}>₹{p.value.toLocaleString('en-IN')}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>INV: ₹{p.invested.toLocaleString('en-IN')}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', minWidth: 80 }}>
                                        <div style={{ fontWeight: 600, color: roi >= 0 ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                                            {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: roi >= 0 ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                                            {gain >= 0 ? '+' : ''}₹{Math.abs(gain).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Investment tips */}
            <div className="card-accent" style={{ marginTop: 24 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--accent-indigo)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Zap size={14} /> PORTFOLIO INTELLIGENCE
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                        'Diversify across large-cap (40%), mid-cap (30%), and small-cap (20%) index funds.',
                        'Review portfolio every 6 months — not every day, to minimize emotional decisions.',
                        `Target investment at 20%+ of income = ₹${Math.round(income * 0.2).toLocaleString('en-IN')}/month SIP.`,
                        'Rebalance annually to maintain your target asset allocation.',
                    ].map((tip, i) => (
                        <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <span style={{ color: 'var(--text-muted)', marginRight: 6 }}>{i + 1}.</span>
                            {tip}
                        </div>
                    ))}
                </div>
            </div>

            {showAdd && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
                    <div className="card anim-fade w-full max-w-md" style={{ background: 'var(--bg-card)', padding: '28px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Register Asset</h3>
                            <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="input-group">
                                <label className="input-label">Asset Name</label>
                                <input className="input" placeholder="e.g. HDFC Nifty 50 Index Fund" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Classification</label>
                                <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ appearance: 'none' }}>
                                    {['Index Fund', 'Mid Cap', 'Large Cap', 'Small Cap', 'ELSS', 'Direct Stock', 'REIT', 'Gold', 'ETF'].map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="input-group">
                                    <label className="input-label">Invested (₹)</label>
                                    <input className="input" type="number" value={form.invested} onChange={e => setForm(f => ({ ...f, invested: e.target.value }))} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Valuation (₹)</label>
                                    <input className="input" type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                                <button className="btn btn-primary" style={{ flex: 1, padding: '12px' }} onClick={addPortfolio}>APPEND ASSET</button>
                                <button className="btn btn-secondary" style={{ padding: '12px 24px' }} onClick={() => setShowAdd(false)}>CANCEL</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
