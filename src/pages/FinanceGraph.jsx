import React, { useState, useContext } from 'react'
import { AppContext } from '../App'
import ForceNodeGraph from '../components/graph/ForceNodeGraph'
import ExpensePanel from '../components/budget/ExpensePanel'
import NodeModal from '../components/budget/NodeModal'
import { Network, Plus, Zap, AlertTriangle, Info, Activity } from 'lucide-react'

export default function FinanceGraph() {
    const { nodes, income, transactions, addNode, normalizePercents, setNodes, bulkUpdateNodes } = useContext(AppContext)
    const [selectedNode, setSelectedNode] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [editNode, setEditNode] = useState(null)

    const totalAlloc = nodes.reduce((s, n) => s + n.percent, 0)
    const totalSpent = transactions.reduce((s, t) => s + t.amount, 0)
    const totalSaved = income - totalSpent

    return (
        <div className="anim-fade">
            {/* Header */}
            <div style={{ marginBottom: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: 6, fontWeight: 500, letterSpacing: '-0.04em' }}>Flow Nodes</h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Income distribution protocols visualized as hierarchical intelligence nodes.</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    {totalAlloc < 100 && (
                        <button className="btn btn-primary" onClick={() => { setEditNode(null); setShowModal(true) }}>
                            <Plus size={16} style={{ marginRight: 4 }} /> NEW NODE
                        </button>
                    )}
                    {totalAlloc > 100 && (
                        <button className="btn btn-secondary" onClick={() => setNodes(normalizePercents(nodes))}>
                            AUTO-BALANCE
                        </button>
                    )}
                </div>
            </div>

            {/* Allocation warning */}
            {totalAlloc !== 100 && nodes.length > 0 && (
                <div className="glass" style={{
                    marginBottom: 16, padding: '12px 16px',
                    background: totalAlloc > 100 ? 'rgba(239,68,68,.05)' : 'rgba(245,158,11,.05)',
                    border: `1px solid ${totalAlloc > 100 ? 'rgba(239,68,68,.2)' : 'rgba(245,158,11,.2)'}`,
                    borderRadius: 12, fontSize: '0.83rem',
                    color: totalAlloc > 100 ? 'var(--red)' : 'var(--yellow)',
                    display: 'flex', alignItems: 'center', gap: 10,
                }}>
                    {totalAlloc > 100 ? <AlertTriangle size={16} /> : <Info size={16} />}
                    <span>
                        {totalAlloc > 100
                            ? `Allocated ${totalAlloc}% — ${totalAlloc - 100}% over limit. Click "Auto-balance" to fix.`
                            : `Allocated ${totalAlloc}% — ${100 - totalAlloc}% unallocated. Add more nodes or increase existing ones.`}
                    </span>
                </div>
            )}

            {/* Main layout: graph + panel */}
            <div style={{ display: 'grid', gridTemplateColumns: selectedNode ? '1fr 320px' : '1fr', gap: 16 }}>
                {/* Graph */}
                <div>
                    <ForceNodeGraph
                        onNodeClick={id => setSelectedNode(prev => prev === id ? null : id)}
                        selectedNodeId={selectedNode}
                    />

                    {/* Node cards below graph */}
                    {nodes.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginTop: 24 }}>
                            {nodes.map(n => {
                                const nodeTx = transactions.filter(t => t.category === n.id)
                                const spent = nodeTx.reduce((s, t) => s + t.amount, 0)
                                const alloc = income * (n.percent / 100)
                                const ratio = alloc > 0 ? spent / alloc : 0
                                const statusCol = ratio >= 0.95 ? 'var(--red)' : ratio >= 0.75 ? 'var(--yellow)' : 'var(--text-secondary)'
                                return (
                                    <div
                                        key={n.id}
                                        onClick={() => { setSelectedNode(n.id); setEditNode(null) }}
                                        onDoubleClick={() => { setEditNode(n); setShowModal(true) }}
                                        style={{
                                            background: selectedNode === n.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${selectedNode === n.id ? 'var(--border-bright)' : 'var(--border)'}`,
                                            borderRadius: 'var(--radius-sm)',
                                            padding: '16px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            boxShadow: selectedNode === n.id ? 'inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
                                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                        }}
                                    >
                                        <div style={{ width: 8, height: 8, background: n.color, borderRadius: '50%', flexShrink: 0, filter: `drop-shadow(0 0 6px ${n.color})` }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{n.name.toUpperCase()}</div>
                                            <div style={{ fontSize: '0.7rem', color: statusCol, marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                                                {Math.round(ratio * 100)}% CONSUMED
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                            {n.percent}%
                                        </div>
                                    </div>
                                )
                            })}
                            <div
                                onClick={() => { setEditNode(null); setShowModal(true) }}
                                style={{
                                    background: 'transparent', padding: '16px', cursor: 'pointer',
                                    border: '1px dashed var(--border-bright)', borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8,
                                    justifyContent: 'center', transition: 'all 0.2s', letterSpacing: '0.05em', fontWeight: 600
                                }}
                            >
                                <Plus size={14} /> APPEND
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {nodes.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔮</div>
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>Start with the 20/30/50 rule</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>Industry standard: 50% Needs, 30% Wants, 20% Invest</div>
                            <button className="btn btn-primary" onClick={() => {
                                setNodes([
                                    { id: 'needs', name: 'Needs', percent: 50, color: '#22d3ee', spent: 0 },
                                    { id: 'wants', name: 'Wants', percent: 30, color: '#f59e0b', spent: 0 },
                                    { id: 'invest', name: 'Invest', percent: 20, color: '#10b981', spent: 0 },
                                ])
                            }}>🚀 Apply 50/30/20 Split</button>
                        </div>
                    )}
                </div>

                {/* Expense panel */}
                {selectedNode && (
                    <div className="anim-slide">
                        <ExpensePanel nodeId={selectedNode} onClose={() => setSelectedNode(null)} />
                    </div>
                )}
            </div>

            {/* Modals */}
            {showModal && <NodeModal node={editNode} onClose={() => { setShowModal(false); setEditNode(null) }} />}
        </div>
    )
}