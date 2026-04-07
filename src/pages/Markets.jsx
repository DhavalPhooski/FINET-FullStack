import React, { useState, useEffect } from 'react'
import SensexChart from '../components/charts/SensexChart'
import { TrendingUp, TrendingDown, Activity, BarChart2, Globe, Zap } from 'lucide-react'

// ─── Data definitions ────────────────────────────────────────────────────────
const INDICES = [
    { name: 'SENSEX', value: 73241.85, change: +312.40, pct: +0.43, exchange: 'BSE' },
    { name: 'NIFTY 50', value: 22198.65, change: +98.15, pct: +0.44, exchange: 'NSE' },
    { name: 'BANK NIFTY', value: 48122.30, change: -84.20, pct: -0.17, exchange: 'NSE' },
    { name: 'NIFTY IT', value: 36411.75, change: +441.55, pct: +1.23, exchange: 'NSE' },
    { name: 'NIFTY MID150', value: 18322.00, change: +56.45, pct: +0.31, exchange: 'NSE' },
    { name: 'NIFTY NEXT50', value: 62841.20, change: -125.30, pct: -0.20, exchange: 'NSE' },
]

const TOP_MOVERS_GAINERS = [
    { symbol: 'IRFC', name: 'Indian Railway Finance', price: 218.45, pct: +8.24, vol: '142M' },
    { symbol: 'ZOMATO', name: 'Zomato', price: 168.30, pct: +5.82, vol: '98M' },
    { symbol: 'ADANIPORTS', name: 'Adani Ports', price: 1312.20, pct: +3.46, vol: '34M' },
    { symbol: 'HCLTECH', name: 'HCL Technologies', price: 1721.85, pct: +2.91, vol: '18M' },
    { symbol: 'WIPRO', name: 'Wipro', price: 542.50, pct: +2.60, vol: '29M' },
]

const TOP_MOVERS_LOSERS = [
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance', price: 6821.30, pct: -3.14, vol: '12M' },
    { symbol: 'POWERGRID', name: 'Power Grid Corp', price: 312.40, pct: -2.82, vol: '44M' },
    { symbol: 'NTPC', name: 'NTPC', price: 378.55, pct: -1.97, vol: '67M' },
    { symbol: 'BPCL', name: 'BPCL', price: 624.80, pct: -1.63, vol: '21M' },
    { symbol: 'COALINDIA', name: 'Coal India', price: 442.10, pct: -1.21, vol: '38M' },
]

const SECTORS = [
    { name: 'IT', pct: +1.84, size: 'lg' },
    { name: 'FMCG', pct: +0.62, size: 'md' },
    { name: 'Auto', pct: +0.44, size: 'md' },
    { name: 'Pharma', pct: +0.38, size: 'sm' },
    { name: 'Metals', pct: +0.12, size: 'sm' },
    { name: 'Finance', pct: -0.17, size: 'lg' },
    { name: 'Energy', pct: -0.63, size: 'md' },
    { name: 'Real Estate', pct: -0.88, size: 'sm' },
    { name: 'Infra', pct: -1.14, size: 'sm' },
    { name: 'PSU Banks', pct: +0.21, size: 'md' },
    { name: 'Media', pct: +1.42, size: 'sm' },
    { name: 'Telecom', pct: -0.29, size: 'sm' },
]

function useTickingIndices() {
    const [live, setLive] = useState(INDICES)
    useEffect(() => {
        const id = setInterval(() => {
            setLive(prev => prev.map(idx => {
                const delta = (Math.random() - 0.5) * (idx.value * 0.0003)
                const newVal = idx.value + delta
                const newChange = idx.change + delta
                const newPct = (newChange / (idx.value - idx.change)) * 100
                return { ...idx, value: newVal, change: newChange, pct: newPct }
            }))
        }, 2000)
        return () => clearInterval(id)
    }, [])
    return live
}

export default function Markets() {
    const liveIndices = useTickingIndices()
    const marketTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

    return (
        <div className="anim-fade">
            {/* Header */}
            <div style={{ marginBottom: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 500, letterSpacing: '-0.04em', marginBottom: 6 }}>Market Intelligence</h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Live Indian equity market data — Sensex, Nifty, and sector pulse.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, justifyContent: 'flex-end' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s infinite' }} />
                        <span style={{ fontSize: '0.72rem', color: 'var(--green)', fontWeight: 600, letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>LIVE</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>NSE IST {marketTime}</div>
                </div>
            </div>

            {/* Index Minibar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
                {liveIndices.slice(0, 6).map(idx => {
                    const up = idx.pct >= 0
                    return (
                        <div key={idx.name} className="card" style={{ padding: '20px 24px', background: 'var(--bg-deep)', border: `1px solid ${up ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 6 }}>{idx.exchange} · {idx.name}</div>
                                    <div style={{ fontSize: '1.35rem', fontWeight: 500, fontFamily: 'var(--font-mono)', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                                        {idx.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: up ? 'var(--green)' : 'var(--red)' }}>
                                        {up ? '+' : ''}{idx.pct.toFixed(2)}%
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: up ? 'rgba(16,185,129,0.7)' : 'rgba(244,63,94,0.7)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                                        {up ? '+' : ''}{idx.change.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Main Chart */}
            <div className="card" style={{ marginBottom: 32, padding: 0, overflow: 'hidden', background: 'var(--bg-deep)', border: '1px solid var(--border)' }}>
                <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                                <span style={{ fontSize: '1.6rem', fontWeight: 500, fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em' }}>
                                    {liveIndices[0].value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </span>
                                <span style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: liveIndices[0].pct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                                    {liveIndices[0].pct >= 0 ? '+' : ''}{liveIndices[0].pct.toFixed(2)}%
                                </span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>BSE SENSEX · 5 MIN OHLC · INTRADAY</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            {[['O', '73128.40'], ['H', '73512.60'], ['L', '72988.35'], ['C', liveIndices[0].value.toFixed(2)]].map(([l, v]) => (
                                <div key={l} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 2 }}>{l}</div>
                                    <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{v}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div style={{ padding: '16px 12px 8px' }}>
                    <SensexChart />
                </div>
            </div>

            {/* Top Movers + Sector Heatmap */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                {/* Gainers */}
                <div className="card" style={{ background: 'var(--bg-deep)' }}>
                    <div className="section-title" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TrendingUp size={16} color="var(--green)" /> TOP GAINERS
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {TOP_MOVERS_GAINERS.map((s) => (
                            <div key={s.symbol} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <TrendingUp size={14} color="var(--green)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '-0.01em' }}>{s.symbol}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.name}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>₹{s.price.toLocaleString('en-IN')}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--green)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>+{s.pct}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Losers */}
                <div className="card" style={{ background: 'var(--bg-deep)' }}>
                    <div className="section-title" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TrendingDown size={16} color="var(--red)" /> TOP LOSERS
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {TOP_MOVERS_LOSERS.map((s) => (
                            <div key={s.symbol} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <TrendingDown size={14} color="var(--red)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '-0.01em' }}>{s.symbol}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.name}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>₹{s.price.toLocaleString('en-IN')}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s.pct}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sector Heatmap */}
            <div className="card" style={{ background: 'var(--bg-deep)' }}>
                <div className="section-title" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Globe size={16} color="var(--text-muted)" /> SECTOR HEATMAP
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                    {SECTORS.map(sec => {
                        const intensity = Math.min(Math.abs(sec.pct) / 2, 1)
                        const upColor = `rgba(16,185,129,${0.1 + intensity * 0.5})`
                        const downColor = `rgba(244,63,94,${0.1 + intensity * 0.5})`
                        const bg = sec.pct >= 0 ? upColor : downColor
                        const border = sec.pct >= 0 ? `rgba(16,185,129,${0.2 + intensity * 0.3})` : `rgba(244,63,94,${0.2 + intensity * 0.3})`
                        const textCol = sec.pct >= 0 ? 'var(--green)' : 'var(--red)'
                        return (
                            <div key={sec.name} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 'var(--radius-sm)', padding: '16px 12px', textAlign: 'center', transition: 'all 0.3s' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{sec.name}</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: textCol }}>
                                    {sec.pct >= 0 ? '+' : ''}{sec.pct.toFixed(2)}%
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 24, fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 24, height: 8, borderRadius: 2, background: 'rgba(16,185,129,0.5)', border: '1px solid rgba(16,185,129,0.4)' }} />
                        GAINERS
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 24, height: 8, borderRadius: 2, background: 'rgba(244,63,94,0.5)', border: '1px solid rgba(244,63,94,0.4)' }} />
                        LOSERS
                    </div>
                    <span>Intensity = magnitude of change</span>
                </div>
            </div>
        </div>
    )
}
