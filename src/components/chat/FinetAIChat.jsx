import React, { useState, useContext, useRef, useEffect } from 'react'
import { AppContext } from '../../App'

// Simple rule-based financial advisor
function getAIResponse(message, ctx) {
  const msg = message.toLowerCase()
  const { income, nodes, transactions } = ctx
  const totalSpent = transactions.reduce((s, t) => s + t.amount, 0)
  const totalSaved = Math.max(0, income - totalSpent)
  const savingsRate = income > 0 ? Math.round((totalSaved / income) * 100) : 0

  if (msg.match(/sip|mutual fund/)) return `📈 Great question! A SIP (Systematic Investment Plan) lets you invest a fixed amount monthly in mutual funds. With your ₹${income.toLocaleString('en-IN')} income, even starting with ₹${Math.round(income * 0.1).toLocaleString('en-IN')}/month (10%) in a Nifty 50 Index Fund is a solid start. Low expense ratio, diversified, and no timing needed.`

  if (msg.match(/budget|allocation|split/)) return `💡 The classic 50/30/20 rule for ₹${income.toLocaleString('en-IN')}: Needs ₹${Math.round(income * 0.5).toLocaleString('en-IN')} | Wants ₹${Math.round(income * 0.3).toLocaleString('en-IN')} | Invest/Save ₹${Math.round(income * 0.2).toLocaleString('en-IN')}. Your current savings rate is ${savingsRate}% — ${savingsRate >= 20 ? '✅ great!' : '⚠️ try to push toward 20%.'}`

  if (msg.match(/tax|80c|section/)) return `💰 Under Section 80C, you can save tax on ₹1.5L/year. Best options: ELSS funds (3-yr lock, equity returns), PPF (15-yr, guaranteed, EEE), NPS (extra ₹50K under 80CCD(1B)). If you're in 30% bracket, 80C alone saves ₹46,800/year!`

  if (msg.match(/emergency fund|emergency/)) return `🛡️ Emergency fund = 6 months of expenses. For you that's roughly ₹${Math.round(totalSpent > 0 ? totalSpent * 6 : income * 3).toLocaleString('en-IN')}. Keep it in a liquid fund or high-yield savings — don't invest it in markets. It's your financial immune system.`

  if (msg.match(/how much.*save|save how/)) return `💎 You've saved ₹${totalSaved.toLocaleString('en-IN')} (${savingsRate}% of income) this month. Financial target: save 20%+ consistently. With ₹${Math.round(income * 0.2).toLocaleString('en-IN')}/month, you'd have ₹${Math.round(income * 0.2 * 12).toLocaleString('en-IN')} in a year before any returns.`

  if (msg.match(/stock|equity|nifty|sensex/)) return `📊 For stocks, start with index funds (Nifty 50 or Nifty Next 50) — diversified, low cost. Once comfortable, explore multi-cap funds. Direct stock picking requires research; as a beginner, stick to index funds via SIP. Avoid timing the market!`

  if (msg.match(/crypto|bitcoin|ethereum/)) return `⚡ Crypto is high risk, high reward. If you choose to invest, limit to 5% max of portfolio. Only invest what you can afford to lose 100%. Use regulated platforms (CoinDCX, WazirX). Remember: 30% flat tax + 1% TDS on every sale in India.`

  if (msg.match(/loan|emi|debt/)) return `🏦 Priority: high-interest debt first (credit cards at 36%/yr > personal loans at 12-18% > home loans at 8-9%). Never invest in markets while carrying high-interest debt. Clear it first, then invest. The guaranteed "return" from clearing debt is its interest rate.`

  if (msg.match(/insurance|term life|health/)) return `🛡️ Two essential insurances: (1) Term life: ₹1 crore cover costs ~₹6-8K/year if bought at 25. Buy ASAP — premiums rise with age. (2) Health insurance: ₹10-15 lakh floater for yourself. Don't rely only on employer coverage.`

  if (msg.match(/retire|fire|financial independence/)) return `🏖️ FIRE (Financial Independence) = save 25× your annual expenses. At ₹${income.toLocaleString('en-IN')}/month income, if you save ${savingsRate}%, you'd hit FIRE in ~${Math.round(25 / (savingsRate / 100 / (1 - savingsRate / 100)))} years (simplified). Aggressive saving + investing is the only lever.`

  if (msg.match(/hello|hi|hey|start/)) return `👋 Hi! I'm FINET AI, your personal finance advisor. Ask me about: budgeting, SIPs, tax saving, emergency funds, insurance, stocks, FIR E planning, loans — anything money-related! Your income is ₹${income.toLocaleString('en-IN')}/month and you've saved ${savingsRate}% this month.`

  if (msg.match(/spent|expense|spend/)) return `📊 This month you've logged ₹${totalSpent.toLocaleString('en-IN')} in expenses across ${transactions.length} transactions. ${nodes.length} budget nodes are active. ${savingsRate >= 20 ? '✅ You\'re tracking well!' : '⚠️ Try to reduce discretionary spending to hit 20% savings.'}`

  return `🤔 Great question! As a general rule: track every expense (FINET makes this easy), always pay yourself first (save before spending), diversify investments, maintain an emergency fund, and get term insurance early. Want me to elaborate on any specific topic?`
}

export default function FinetAIChat({ isOpen, onClose }) {
  const ctx = useContext(AppContext)
  const [messages, setMessages] = useState([
    { role: 'ai', text: `👋 Hi! I'm FINET AI. Ask me anything about budgeting, SIPs, tax saving, or personal finance!` }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setTyping(true)
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: getAIResponse(userMsg, ctx) }])
      setTyping(false)
    }, 700 + Math.random() * 500)
  }

  if (!isOpen) return null
  return (
    <div className="chat-panel">
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🤖</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>FINET AI Advisor</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} /> Online
          </div>
        </div>
        <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div className={`chat-message ${m.role}`} style={{ fontSize: '0.83rem', lineHeight: 1.5 }}>{m.text}</div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', gap: 4, padding: '8px 12px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', animation: `pulse 1s infinite ${i * 0.2}s` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ padding: '8px 14px', display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid var(--border)' }}>
        {['💰 Budget tips', '📈 Start SIP', '🛡️ Insurance', '💎 Tax saving'].map(q => (
          <button key={q} onClick={() => { setInput(q); }}
            style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: 99, background: 'rgba(124,92,252,.1)', border: '1px solid rgba(124,92,252,.25)', color: 'var(--accent)', cursor: 'pointer' }}>
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0 }}>
        <input
          className="input"
          style={{ flex: 1, fontSize: '0.84rem', padding: '8px 12px' }}
          placeholder="Ask about SIP, budgeting, tax…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button className="btn btn-primary btn-sm" onClick={send} disabled={!input.trim()}>Send</button>
      </div>
    </div>
  )
}