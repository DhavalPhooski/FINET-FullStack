import React from 'react'
import DynamicNodalGraph from '../graph/DynamicNodalGraph'
import Card from '../common/Card'
import { Edit3, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react'

export default function BudgetPlanner({ income, nodes, setNodes }){
  const totalAllocated = nodes.reduce((s,n)=>s+n.percent,0)
  const handleAddNode = ()=>{ const newNode = { id: Date.now(), name: 'New Category', percent: 0, color: '#64748b' }; setNodes(prev=>[...prev,newNode]) }
  const setNodeField = (id, field, value) => setNodes(prev=>prev.map(n=> n.id===id?{...n,[field]:value}:n))
  const deleteNode = (id) => setNodes(prev=>prev.filter(n=>n.id!==id))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-bold">Dynamic Budget Engine</h2><p className="text-sm text-slate-500">Customize your financial flow nodes.</p></div>
        {totalAllocated !== 100 ? (<div className="text-red-600"><AlertTriangle /> Total: {totalAllocated}% / 100%</div>) : (<div className="text-green-700"><ShieldCheck /> Perfectly Balanced</div>)}
      </div>
      <DynamicNodalGraph income={income} nodes={nodes} onNodeClick={(id)=>{ /* handled in page */ }} onAddNode={handleAddNode} />
      <Card>
        import ForceGraph2D from 'react-force-graph-2d';

const graphData = {
  nodes: [
    { id: 'income', name: 'Income', val: 3 },
    { id: 'budget', name: 'Budget', val: 2 },
    { id: 'ledger', name: 'Ledger', val: 2 },
    { id: 'mentor', name: 'Mentor', val: 1 }
  ],
  links: [
    { source: 'income', target: 'budget' },
    { source: 'budget', target: 'ledger' },
    { source: 'ledger', target: 'mentor' }
  ]
};

export default function GraphCanvas() {
  return (
    <div style={{ height: '600px', width: '100%' }}>
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="name"
        nodeAutoColorBy="group"
        linkDirectionalParticles={4}
        linkDirectionalParticleSpeed={0.008}
      />
    </div>
  );
          {nodes.map(node=> (
            <div key={node.id} className="p-2 border rounded flex items-center justify-between">
              <div>
                <div className="font-bold">{node.name}</div>
                <div className="text-xs">{node.percent}%</div>
              </div>
              <div className="flex items-center gap-2">
                <input type="range" min="0" max="100" value={node.percent} onChange={(e)=>setNodeField(node.id,'percent',Number(e.target.value))} />
                <button onClick={()=>deleteNode(node.id)} className="text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}