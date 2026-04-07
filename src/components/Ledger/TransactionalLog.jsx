import React, { useMemo, useState } from 'react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import { Search, Calendar, Filter, ArrowUpDown, Edit3, Trash2 } from 'lucide-react'
import TransactionModal from './TransactionModal'

export default function TransactionLog({ transactions, nodes, onAdd, onEdit, onDelete }){
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTx, setEditingTx] = useState(null)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [filterCategory, setFilterCategory] = useState('All')
  const [sortConfig, setSortConfig] = useState('date-desc')

  const filtered = useMemo(()=>{
    let res=[...transactions]
    if(search) res=res.filter(t=>t.title.toLowerCase().includes(search.toLowerCase()))
    if(filterCategory!=='All') res=res.filter(t=>t.category===filterCategory)
    // date and sort simplified for brevity
    if(sortConfig==='date-desc') res.sort((a,b)=>new Date(b.date)-new Date(a.date))
    return res
  },[transactions, search, filterCategory, sortConfig])

  const openNew = ()=>{ setEditingTx(null); setIsModalOpen(true) }
  const openEdit = (tx)=>{ setEditingTx(tx); setIsModalOpen(true) }
  const handleSave = (data)=>{ editingTx ? onEdit(data) : onAdd(data) }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><div><h2 className="text-2xl font-bold">Ledger</h2><p className="text-sm text-slate-500">Track expenses</p></div><button onClick={openNew} className="bg-blue-600 text-white px-3 py-2 rounded">Add</button></div>
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3">
          <div className="relative"><Search className="absolute left-3 top-3"/><input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9 p-2 border w-full"/></div>
          <div className="relative"><Calendar className="absolute left-3 top-3"/><select value={dateFilter} onChange={e=>setDateFilter(e.target.value)} className="pl-9 p-2 border w-full"><option value="all">All Time</option></select></div>
          <div className="relative"><Filter className="absolute left-3 top-3"/><select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} className="pl-9 p-2 border w-full"><option value="All">All Categories</option>{nodes.map(n=> <option key={n.id} value={n.name}>{n.name}</option>)}</select></div>
          <div className="relative"><ArrowUpDown className="absolute left-3 top-3"/><select value={sortConfig} onChange={e=>setSortConfig(e.target.value)} className="pl-9 p-2 border w-full"><option value="date-desc">Date (Newest)</option></select></div>
        </div>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50"><tr><th className="px-6 py-3">Date</th><th className="px-6 py-3">Title</th><th className="px-6 py-3">Category</th><th className="px-6 py-3 text-right">Amount</th><th className="px-6 py-3 text-center">Actions</th></tr></thead>
          <tbody>
            {filtered.length>0 ? filtered.map(t=> (
              <tr key={t.id} className="hover:bg-slate-50"><td className="px-6 py-3 font-mono text-xs">{t.date}</td><td className="px-6 py-3 font-bold">{t.title}</td><td className="px-6 py-3"><Badge color="slate">{t.category}</Badge></td><td className="px-6 py-3 text-right font-bold">₹{t.amount.toLocaleString()}</td><td className="px-6 py-3 text-center"><div className="flex gap-2 justify-center"><button onClick={()=>openEdit(t)} className="text-blue-600"><Edit3 size={14} /></button><button onClick={()=>onDelete(t.id)} className="text-red-600"><Trash2 size={14} /></button></div></td></tr>
            )) : (<tr><td colSpan={5} className="p-8 text-center text-slate-400">No transactions</td></tr>)}
          </tbody>
        </table>
      </Card>

      <TransactionModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} onSave={handleSave} nodes={nodes} editingTransaction={editingTx} />
    </div>
  )
}