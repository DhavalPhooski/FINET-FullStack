import React from 'react'
import { X, Edit3, Plus } from 'lucide-react'

export default function TransactionModal({ isOpen, onClose, onSave, nodes, editingTransaction }){
  if(!isOpen) return null
  const handleSubmit = (e)=>{ e.preventDefault(); const fd=new FormData(e.target); const data={ id: editingTransaction?.id||Date.now(), title: fd.get('title'), amount: Number(fd.get('amount')), category: fd.get('category'), date: fd.get('date') }; onSave(data); onClose(); }
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card anim-fade w-full max-w-md" style={{ background: 'var(--bg-card)', padding: '28px' }}>
        <div className="flex justify-between items-center mb-6">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>{editingTransaction ? 'Modify' : 'New'} Entry</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="input-group">
            <label className="input-label">Title</label>
            <input name="title" defaultValue={editingTransaction?.title || ''} required className="input" placeholder="e.g. Monthly Rent" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label">Amount</label>
              <input name="amount" type="number" defaultValue={editingTransaction?.amount || 0} required className="input" />
            </div>
            <div className="input-group">
              <label className="input-label">Date</label>
              <input name="date" type="date" defaultValue={editingTransaction?.date || new Date().toISOString().split('T')[0]} required className="input" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Node Category</label>
            <select name="category" defaultValue={editingTransaction?.category || nodes[0]?.name} className="input" style={{ appearance: 'none' }}>
              {nodes.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
            </select>
          </div>

          <div className="flex justify-end mt-4">
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>
              {editingTransaction ? 'Update Node' : 'Initialize Node'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}