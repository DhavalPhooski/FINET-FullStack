import React, { useContext } from 'react'
import { AppContext } from '../App'
import { Landmark, ShieldAlert, CreditCard, Calendar, Target, CheckCircle2, ChevronRight, Zap } from 'lucide-react'

export default function Loans() {
    const { loans, setLoans } = useContext(AppContext)

    const totalRemaining = loans.reduce((s, l) => s + l.remaining, 0)
    const totalEMI = loans.reduce((s, l) => s + l.emi, 0)

    return (
        <div className="anim-fade">
            <div style={{ marginBottom: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: 6, fontWeight: 500, letterSpacing: '-0.04em' }}>Liability Architecture</h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Debt monitoring, parity checking, and liquidation logs.</p>
                </div>
            </div>

            <div className="bento-grid" style={{ marginBottom: 32 }}>
                <div className="bento-card bento-6" style={{ padding: 32 }}>
                    <div className="stat-label">Total Outstanding</div>
                    <div className="stat-value" style={{ fontFamily: 'var(--font-mono)', color: totalRemaining > 0 ? 'var(--red)' : 'var(--text-primary)' }}>₹{totalRemaining.toLocaleString()}</div>
                </div>
                <div className="bento-card bento-6" style={{ padding: 32 }}>
                    <div className="stat-label">Debt Servicing (EMI)</div>
                    <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>₹{totalEMI.toLocaleString()}</div>
                </div>
            </div>

            <div className="card">
                <div className="section-title" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Landmark size={16} color="var(--text-muted)" /> Active Liabilities
                </div>
                {loans.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                        <CheckCircle2 size={48} style={{ marginBottom: 20, color: 'var(--green)', filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.3))' }} />
                        <div style={{ fontWeight: 600, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Liability Level: ZERO</div>
                        <div style={{ fontSize: '0.85rem', marginTop: 8 }}>System is currently debt-free. Optimal status maintained.</div>
                    </div>
                ) : (
                    loans.map(loan => {
                        const paid = loan.principal - loan.remaining
                        const progress = loan.principal > 0 ? (paid / loan.principal) * 100 : 0
                        return (
                            <div key={loan.id} style={{ marginBottom: 24, padding: '20px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-deep)' }}>
                                <div className="flex-between" style={{ marginBottom: 16 }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem', letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>{loan.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 4 }}>
                                            {loan.bank} · {loan.interestRate}% P.A.
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--red)', fontSize: '1.1rem', fontFamily: 'var(--font-mono)' }}>₹{loan.remaining.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.05em', marginTop: 4 }}>REMAINING</div>
                                    </div>
                                </div>

                                <div className="progress-wrap" style={{ marginTop: 24 }}>
                                    <div className="progress-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                                        <span>₹{paid.toLocaleString()} / ₹{loan.principal.toLocaleString()}</span>
                                        <span style={{ color: 'var(--green)' }}>{progress.toFixed(1)}% REPAID</span>
                                    </div>
                                    <div className="progress-track" style={{ height: 6, background: 'rgba(255,255,255,0.03)' }}>
                                        <div className="progress-fill green" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 32, marginTop: 16, fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                                    <span>EMI: <strong style={{ color: 'var(--text-primary)' }}>₹{loan.emi.toLocaleString()}</strong> / MO</span>
                                    <span>TENURE: <strong style={{ color: 'var(--text-primary)' }}>{loan.tenureMonths}</strong> MTHS</span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Debt tips */}
            <div className="card-accent" style={{ marginTop: 24 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--accent-indigo)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Target size={14} /> LIQUIDATION STRATEGY
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                        'Avalanche Method: Pay minimum on all, put extra capital on highest-interest loan first.',
                        'Snowball Method: Pay minimum on all, clear smallest balance first for psychological momentum.',
                        'Avoid deploying capital into equity while carrying high-interest debt (e.g. Credit Cards, Personal Loans).',
                        'Home loan interest (8-9%) is typically low enough to permit parallel equity SIP investments.',
                    ].map((t, i) => (
                        <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <span style={{ color: 'var(--text-muted)', marginRight: 6 }}>{i + 1}.</span>
                            {t}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
