import React from 'react'
import { useJourney } from '../context/JourneyContext'
import { useAuth } from '../hooks/useAuth'
import { Award, Briefcase, TrendingUp, Book, Download, Share2, ShieldCheck, Sparkles } from 'lucide-react'

export default function IntelligenceReport() {
  const { journey } = useJourney()
  const { user } = useAuth()
  
  const printReport = () => window.print()

  if (!journey.profile) return <div style={{ padding: 40, textAlign: 'center' }}>Initialize your Coach profile to generate reports.</div>

  return (
    <div className="anim-fade" style={{ maxWidth: 850, margin: '0 auto', background: '#fff', color: '#000', padding: 40, borderRadius: 12, boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} id="printable-report">
      {/* Report Header */}
      <div style={{ borderBottom: '2px solid #000', paddingBottom: 24, marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-indigo)', marginBottom: 8 }}>Weekly Intelligence Briefing / {new Date().toLocaleDateString()}</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#000', letterSpacing: '-0.04em' }}>FINET Intelligence Report</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Subject: {user.full_name}</div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>Protocol Level: {journey.level}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 40 }}>
        {/* Section 1: Executive Summary */}
        <div style={{ padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #eee', paddingBottom: 10, marginBottom: 16 }}>
            <Award size={18} /> Executive Summary
          </h3>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#444' }}>
            In the last 7 days, you've achieved a **{journey.streak}-day streak** and mastered **{journey.cognitionHistory.length} core topics**. 
            Your capital efficiency is currently at **OPTIMAL** status for your {journey.profile.tierInfo.label} tier.
          </p>
          <div style={{ marginTop: 20, padding: 12, background: '#f8f9ff', borderRadius: 6, borderLeft: '4px solid var(--accent-indigo)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-indigo)', marginBottom: 4 }}>COACH VERDICT</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>"Stay focused on liquidity. You've cleared foundations; move to expansion nodes."</div>
          </div>
        </div>

        {/* Section 2: Cognition Map */}
        <div style={{ padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #eee', paddingBottom: 10, marginBottom: 16 }}>
            <Book size={18} /> Knowledge Acquisition
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {journey.cognitionHistory.length > 0 ? journey.cognitionHistory.map((topic, i) => (
              <span key={i} style={{ padding: '4px 12px', background: '#eee', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>{topic}</span>
            )) : <div style={{ fontSize: '0.8rem', color: '#999' }}>Read articles to build your cognition history.</div>}
          </div>
        </div>
      </div>

      {/* Section 3: Strategy Roadmap */}
      <div style={{ marginBottom: 40 }}>
        <h3 style={{ borderBottom: '1px solid #000', paddingBottom: 12, marginBottom: 20 }}>Intelligence Roadmap Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {journey.profile.roadmap.slice(0, 3).map((r, i) => (
            <div key={i} style={{ padding: 20, background: journey.roadmapDone.includes(r.id) ? 'rgba(16,185,129,0.05)' : '#fff', border: '1px solid #eee', borderRadius: 8 }}>
              <div style={{ fontSize: '0.65rem', marginBottom: 4, opacity: 0.6 }}>{r.phase}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 8, color: journey.roadmapDone.includes(r.id) ? 'var(--green)' : '#000' }}>{r.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>Status: {journey.roadmapDone.includes(r.id) ? 'DEPLOYED' : 'PENDING'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '2px solid #000', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={16} /> Secure Protocol FINET-V5.2
        </div>
        <div style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>Proprietary intelligence analysis for {user.full_name}.</div>
      </div>

      {/* Action Buttons (Non-Printable) */}
      <div className="no-print" style={{ position: 'fixed', bottom: 40, right: 40, display: 'flex', gap: 12 }}>
        <button onClick={printReport} className="btn" style={{ background: '#000', color: '#fff', padding: '12px 24px', borderRadius: 40, boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Download size={18} /> Export PDF Brief
        </button>
        <button className="btn btn-secondary" style={{ background: '#fff', color: '#000', padding: '12px 24px', borderRadius: 40 }}>
          <Share2 size={18} /> Share Digest
        </button>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          #printable-report { box-shadow: none !important; margin: 0 !important; width: 100% !important; padding: 0 !important; }
          body { background: #fff !important; }
        }
      `}</style>
    </div>
  )
}
