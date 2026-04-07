import React from 'react'
const colors = {
  blue: 'badge-cyan',
  green: 'badge-green',
  red: 'badge-red',
  slate: 'badge-slate',
  purple: 'badge-purple',
  yellow: 'badge-yellow',
  indigo: 'badge-purple'
}
export default function Badge({ children, color = 'blue', className = '' }) {
  return <span className={`badge ${colors[color] || colors.blue} ${className}`}>{children}</span>
}