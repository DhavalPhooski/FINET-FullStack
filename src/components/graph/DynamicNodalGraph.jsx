import React, { useState } from 'react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import { Plus } from 'lucide-react'

export default function DynamicNodalGraph({ income, nodes, onNodeClick, onAddNode }){
  const [hoveredNodeId, setHoveredNodeId] = useState(null)
  const centerX = 400; const startY = 50; const level2Y = 250; const width = 800
  const nodeCount = nodes.length; const spacing = width / (nodeCount + 1)

  return (
    <div className="w-full overflow-hidden bg-slate-50 rounded-xl border border-slate-200 p-6 relative min-h-[350px]">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2"><Badge color="indigo">Interactive Graph</Badge></div>
      <div className="absolute top-4 right-4 z-10">
        <button onClick={onAddNode} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-blue-600 rounded-lg text-xs font-bold shadow-sm"><Plus size={14} /> Add</button>
      </div>
      <svg viewBox="0 0 800 350" className="w-full h-full select-none">
        <defs>
          <filter id="shadow"><feGaussianBlur in="SourceAlpha" stdDeviation="3" /></filter>
        </defs>
        <g>
          <circle cx={centerX} cy={startY} r="45" fill="#3b82f6" />
          <text x={centerX} y={startY} dy=".3em" textAnchor="middle" fill="white" className="text-xs font-bold">Income</text>
          <text x={centerX} y={startY + 65} textAnchor="middle" className="text-sm font-bold text-slate-800">₹{income.toLocaleString()}</text>
        </g>
        {nodes.map((node, index) => {
          const xPos = spacing * (index + 1)
          const isHovered = hoveredNodeId === node.id
          const safePercent = Math.max(0, node.percent)
          const baseRadius = 35 + (safePercent * 0.3)
          const radius = isHovered ? baseRadius + 6 : baseRadius
          const amount = Math.round(income * (node.percent / 100))
          return (
            <g key={node.id} onClick={(e)=>{e.stopPropagation(); onNodeClick?.(node.id)}} onMouseEnter={()=>setHoveredNodeId(node.id)} onMouseLeave={()=>setHoveredNodeId(null)} className="cursor-pointer">
              <path d={`M ${centerX} ${startY + 45} C ${centerX} ${startY + 150}, ${xPos} ${startY + 100}, ${xPos} ${level2Y - radius}`} fill="none" stroke={node.color} strokeWidth={isHovered ? 3 : 2} strokeOpacity={isHovered ? 0.8 : 0.4} />
              <circle cx={xPos} cy={level2Y} r={radius} fill={node.color} />
              <text x={xPos} y={level2Y} dy="-.2em" textAnchor="middle" fill="white" className="text-xs font-bold">{node.name}</text>
              <text x={xPos} y={level2Y} dy=".9em" textAnchor="middle" fill="white" className="text-[10px] font-medium">{node.percent}%</text>
              <text x={xPos} y={level2Y + radius + 20} textAnchor="middle" className="text-xs font-bold text-slate-700">₹{amount.toLocaleString()}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}