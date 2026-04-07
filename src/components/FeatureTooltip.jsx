import React, { useState, useRef, useEffect } from 'react'
import { Sparkles, Info, X, MessageSquare, Loader2 } from 'lucide-react'
import api from '../utils/api'

export default function FeatureTooltip({ featureKey, title, description, children }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState(null)
  const [showAiModal, setShowAiModal] = useState(false)
  const timeoutRef = useRef(null)

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current)
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false)
    }, 300)
  }

  const askAi = async () => {
    setIsAiLoading(true)
    setShowAiModal(true)
    try {
      const res = await api.post('/chat', {
        message: `Explain the "${title}" feature in detail. What is its financial benefit and how should I use it?`,
        profile: { tier: 'INTERMEDIATE' } // Default or from context
      })
      setAiResponse(res.data.reply)
    } catch (err) {
      setAiResponse("I'm sorry, I couldn't fetch an explanation right now. Please try again later.")
    } finally {
      setIsAiLoading(false)
    }
  }

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%) translateY(-10px)',
          width: '280px',
          background: 'rgba(24, 24, 27, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          zIndex: 1000,
          animation: 'tooltipIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 24, height: 24, borderRadius: '6px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Info size={14} color="#818cf8" />
            </div>
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{title}</h4>
          </div>
          
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.5, marginBottom: 16 }}>
            {description}
          </p>
          
          <button 
            onClick={askAi}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              border: 'none',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
              transition: 'transform 0.1s'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Sparkles size={12} />
            Ask AI about this
          </button>
          
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '6px',
            borderStyle: 'solid',
            borderColor: 'rgba(24, 24, 27, 0.8) transparent transparent transparent'
          }} />
        </div>
      )}

      {showAiModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease'
        }} onClick={() => setShowAiModal(false)}>
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              width: '480px', maxHeight: '80vh', overflowY: 'auto',
              background: '#18181b', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px', padding: '32px',
              boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
              position: 'relative'
            }}
          >
            <button 
              onClick={() => setShowAiModal(false)}
              style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={20} color="#818cf8" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>AI Insights: {title}</h3>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Powered by Finet Intelligence</span>
              </div>
            </div>

            <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
              {isAiLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '40px 0' }}>
                  <Loader2 size={32} color="#818cf8" style={{ animation: 'spin 1.5s linear infinite' }} />
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Synthesizing expert financial knowledge...</p>
                </div>
              ) : (
                aiResponse?.split('\n').map((line, i) => (
                  <p key={i} style={{ marginBottom: line ? '1em' : '0.5em' }}>{line}</p>
                ))
              )}
            </div>

            {!isAiLoading && (
              <button 
                onClick={() => setShowAiModal(false)}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 24, justifyContent: 'center' }}
              >
                Close Insights
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes tooltipIn {
          from { opacity: 0; transform: translateX(-50%) translateY(0); }
          to { opacity: 1; transform: translateX(-50%) translateY(-10px); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
