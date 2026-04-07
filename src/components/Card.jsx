import React from 'react'
export default function Card({ children, className = '', onClick }) {
  return (
    <div onClick={onClick} className={`glass-card ${className}`} style={{ padding: 24 }}>
      {children}
    </div>
  )
}