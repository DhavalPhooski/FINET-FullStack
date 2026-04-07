import React, { useState, useContext } from 'react'
import { AppContext } from '../../App'

const COLORS = ['#7c5cfc', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16']

export default function NodeModal({ node, onClose }) {
    const { addNode, updateNode, removeNode, nodes, income, normalizePercents } = useContext(AppContext)
    const isEdit = !!node?.id

    const [name, setName] = useState(node?.name || '')
    const [percent, setPercent] = useState(node?.percent || 10)
    const [color, setColor] = useState(node?.color || COLORS[0])
    const [error, setError] = useState('')

    const totalOther = nodes.filter(n => n.id !== node?.id).reduce((s, n) => s + n.percent, 0)
    const remaining = 100 - totalOther

    const validate = () => {
        if (!name.trim()) { setError('Node name is required'); return false }
        if (percent <= 0 || percent > remaining) { setError(`Allocation must be 1–${remaining}%`); return false }
        return true
    }

    const handleSave = () => {
        if (!validate()) return
        if (isEdit) {
            updateNode(node.id, { name: name.trim(), percent: Number(percent), color })
        } else {
            addNode({ id: `node-${Date.now()}`, name: name.trim(), percent: Number(percent), color, spent: 0 })
        }
        onClose()
    }

    const handleDelete = () => {
        removeNode(node.id)
        onClose()
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-title">{isEdit ? '✏️ Edit Node' : '✨ Add Budget Node'}</div>

                {/* Allocation breakdown */}
                <div style={{
                    background: 'rgba(124,92,252,.08)', border: '1px solid rgba(124,92,252,.2)',
                    borderRadius: 10, padding: '10px 14px', marginBottom: 20,
                    fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between',
                }}>
                    <span>Total allocated: <strong style={{ color: totalOther > 90 ? 'var(--red)' : 'var(--green)' }}>{totalOther}%</strong></span>
                    <span>Available: <strong style={{ color: 'var(--accent)' }}>{remaining}%</strong></span>
                </div>

                <div className="input-group" style={{ marginBottom: 16 }}>
                    <label className="input-label">Node Name</label>
                    <input className="input" placeholder="e.g. Rent, SIP, Food…" value={name} onChange={e => { setName(e.target.value); setError('') }} />
                </div>

                <div className="input-group" style={{ marginBottom: 16 }}>
                    <label className="input-label">Allocation: <strong style={{ color: 'var(--accent)' }}>{percent}%</strong> = ₹{Math.round(income * percent / 100).toLocaleString('en-IN')}</label>
                    <input
                        type="range" min={1} max={remaining} value={percent}
                        onChange={e => { setPercent(Number(e.target.value)); setError('') }}
                        style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span>1%</span><span>{remaining}%</span>
                    </div>
                </div>

                <div className="input-group" style={{ marginBottom: 20 }}>
                    <label className="input-label">Color</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {COLORS.map(c => (
                            <button
                                key={c} onClick={() => setColor(c)}
                                style={{
                                    width: 28, height: 28, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                                    outline: color === c ? `3px solid #fff` : '3px solid transparent',
                                    outlineOffset: 2, transition: 'all .15s',
                                }}
                            />
                        ))}
                    </div>
                </div>

                {error && <div style={{ color: 'var(--red)', fontSize: '0.82rem', marginBottom: 14, padding: '8px 12px', background: 'rgba(239,68,68,.1)', borderRadius: 8, border: '1px solid rgba(239,68,68,.2)' }}>{error}</div>}

                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
                        {isEdit ? 'Save Changes' : '+ Add Node'}
                    </button>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    {isEdit && <button className="btn btn-danger btn-sm" onClick={handleDelete} title="Delete node">🗑</button>}
                </div>
            </div>
        </div>
    )
}
