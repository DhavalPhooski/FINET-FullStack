import React, { useState, useContext } from 'react'
import { AppContext } from '../../App'

export default function ExpensePanel({ nodeId, onClose }) {
    const { nodes, transactions, addTransaction, deleteTransaction, income } = useContext(AppContext)
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return null

    const nodeTransactions = transactions.filter(t => t.category === nodeId)
    const allocated = income * (node.percent / 100)
    const spent = nodeTransactions.reduce((s, t) => s + t.amount, 0)
    const ratio = allocated > 0 ? spent / allocated : 0

    const [title, setTitle] = useState('')
    const [amount, setAmount] = useState('')
    const [note, setNote] = useState('')
    const [error, setError] = useState('')
    const [adding, setAdding] = useState(false)

    const predictedMonthlySpend = (() => {
        const now = new Date()
        const dayOfMonth = now.getDate()
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        const todaySpent = nodeTransactions
            .filter(t => new Date(t.date).getMonth() === now.getMonth())
            .reduce((s, t) => s + t.amount, 0)
        return dayOfMonth > 0 ? (todaySpent / dayOfMonth) * daysInMonth : 0
    })()

    const willOverspend = predictedMonthlySpend > allocated

    const handleAdd = () => {
        if (!title.trim()) { setError('Title required'); return }
        const amt = parseFloat(amount)
        if (!amt || amt <= 0) { setError('Enter a valid amount'); return }
        addTransaction({ title: title.trim(), amount: amt, category: nodeId, date: new Date().toISOString(), note: note.trim(), id: Date.now() })
        setTitle(''); setAmount(''); setNote(''); setError(''); setAdding(false)
    }

    const progressColor = ratio >= 0.95 ? 'red' : ratio >= 0.75 ? 'yellow' : 'green'

    return (
        <div className="expense-panel" style={{ height: 460 }}>
            {/* Header */}
            <div className="expense-panel-header">
                <div className="flex-between">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: node.color, boxShadow: `0 0 8px ${node.color}88` }} />
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{node.name}</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                </div>

                {/* Progress */}
                <div className="progress-wrap" style={{ marginTop: 12 }}>
                    <div className="progress-header">
                        <span className="text-xs text-muted">₹{spent.toLocaleString('en-IN')} of ₹{Math.round(allocated).toLocaleString('en-IN')}</span>
                        <span className="text-xs" style={{ color: ratio >= 0.95 ? 'var(--red)' : ratio >= 0.75 ? 'var(--yellow)' : 'var(--green)', fontWeight: 700 }}>{Math.round(ratio * 100)}%</span>
                    </div>
                    <div className="progress-track">
                        <div className={`progress-fill ${progressColor}`} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
                    </div>
                </div>

                {/* Predictive alert */}
                {willOverspend && (
                    <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--red)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                        <span>⚠️</span>
                        <span>At this rate, you'll spend ₹{Math.round(predictedMonthlySpend).toLocaleString('en-IN')} — <strong>₹{Math.round(predictedMonthlySpend - allocated).toLocaleString('en-IN')} over budget</strong> by month end.</span>
                    </div>
                )}
            </div>

            {/* Expense list */}
            <div className="expense-list" style={{ flex: 1, overflowY: 'auto', maxHeight: 200 }}>
                {nodeTransactions.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No expenses yet. Log your first one!</div>
                ) : (
                    nodeTransactions.slice(0, 20).map(tx => (
                        <div key={tx.id} className="expense-item">
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{tx.title}</div>
                                {tx.note && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{tx.note}</div>}
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                    {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontWeight: 700, color: 'var(--red)', fontFamily: 'Outfit,sans-serif' }}>−₹{tx.amount.toLocaleString('en-IN')}</span>
                                <button onClick={() => deleteTransaction(tx.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', padding: 2 }} title="Delete">🗑</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add expense form */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
                {adding ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <input className="input" placeholder="Expense title (e.g. Pani Puri)" value={title} onChange={e => { setTitle(e.target.value); setError('') }} style={{ fontSize: '0.85rem' }} />
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input className="input" type="number" placeholder="₹ Amount" value={amount} onChange={e => { setAmount(e.target.value); setError('') }} style={{ flex: 1, fontSize: '0.85rem' }} />
                            <input className="input" placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} style={{ flex: 1, fontSize: '0.85rem' }} />
                        </div>
                        {error && <div style={{ color: 'var(--red)', fontSize: '0.76rem' }}>{error}</div>}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.82rem', padding: '7px' }} onClick={handleAdd}>+ Log Expense</button>
                            <button className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '7px' }} onClick={() => { setAdding(false); setError('') }}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem' }} onClick={() => setAdding(true)}>
                        + Add Expense
                    </button>
                )}
            </div>
        </div>
    )
}
