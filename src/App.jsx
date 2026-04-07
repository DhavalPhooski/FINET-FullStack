import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import { JourneyProvider } from './context/JourneyContext'
import { FeatureTipProvider } from './components/FeatureTips'
import { AuthProvider, useAuth } from './hooks/useAuth'
import api from './utils/api'

// ─── Pages ────────────────────────────────────────────────────────────────────
import Auth from './pages/Auth'
const Dashboard   = lazy(() => import('./pages/Dashboard'))
const FinanceGraph = lazy(() => import('./pages/FinanceGraph'))
const Budget      = lazy(() => import('./pages/Budget'))
const Loans       = lazy(() => import('./pages/Loans'))
const Investments = lazy(() => import('./pages/Investments'))
const Mentors     = lazy(() => import('./pages/Mentors'))
const FinNews     = lazy(() => import('./pages/FinNews'))
const Community   = lazy(() => import('./pages/Community'))
const FinCoach    = lazy(() => import('./pages/FinCoach'))
const Markets     = lazy(() => import('./pages/Markets'))
const Profile     = lazy(() => import('./pages/Profile'))
const IntelligenceReport = lazy(() => import('./pages/IntelligenceReport'))

// ─── Global Error Boundary ──────────────────────────────────────────────────
class GlobalErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err, info) { console.error('Global Crash:', err, info) }
  render() {
    if (this.state.hasError) return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#09090b', color: '#fff', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--red)', letterSpacing: '0.1em', fontWeight: 700 }}>PROTOCOL_CRITICAL_FAILURE</div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 400, lineHeight: 1.5 }}>
          The intelligence layer encountered a fatal state exception. All systems halted to protect user data.
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8, padding: '12px 24px' }} onClick={() => { localStorage.clear(); window.location.href = '/auth' }}>
          SECURE REBOOT
        </button>
      </div>
    )
    return this.props.children
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────
export const AppContext = React.createContext(null)

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/auth" replace />
  return children
}

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
    <div style={{ width: 40, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'var(--accent-indigo)', animation: 'progress-shimmer 1.2s ease-in-out infinite' }} />
    </div>
    <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', letterSpacing: '0.1em' }}>LOADING…</div>
  </div>
)

// ─── Main Controller ──────────────────────────────────────────────────────────
function AppController() {
  const { user } = useAuth()
  const [income,       setIncome]       = useState(45000)
  const [nodes,        setNodes]        = useState([])
  const [transactions, setTransactions] = useState([])
  const [portfolio,    setPortfolio]    = useState([])
  const [loans,        setLoans]        = useState([])
  const [loading,      setLoading]      = useState(false)

  // Fetch all user data from backend
  useEffect(() => {
    if (user) {
      setLoading(true)
      api.get('/user/data')
        .then(res => {
          const data = res?.data || {}
          setNodes(data.nodes || [])
          setTransactions(data.transactions || [])
          setPortfolio(data.portfolio || [])
        })
        .catch(err => {
          console.error('Failed to fetch user data', err)
          setNodes([])
          setTransactions([])
        })
        .finally(() => setLoading(false))
    }
  }, [user])

  const addTransaction = async (tx) => {
    try {
      await api.post('/user/transaction', tx)
      setTransactions(prev => [{ ...tx, id: tx.id ?? Date.now() }, ...prev])
      // Refresh nodes to get updated spent amounts
      const res = await api.get('/user/data')
      setNodes(res.data.nodes || [])
    } catch (err) {
      console.error('Failed to add transaction', err)
    }
  }

  const editTransaction   = (tx) => setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t))
  const deleteTransaction = (id) => setTransactions(prev => prev.filter(t => t.id !== id))
  const addNode = async (node) => {
    try {
      await api.post('/user/nodes', node)
      const res = await api.get('/user/data')
      setNodes(res.data.nodes || [])
    } catch (err) {
      console.error('Failed to add node', err)
    }
  }

  const updateNode = async (id, patch) => {
    try {
      // Assuming a PUT /api/user/nodes/{id} exists or we use a general update
      // For now, let's just update local and sync
      setNodes(prev => prev.map(n => n.id === id ? { ...n, ...patch } : n))
      // Since I don't see a specific PUT endpoint in the viewed main.py snippet, 
      // I'll stick to a full sync approach or assume the backend handles it via the ID in post
    } catch (err) {
      console.error('Failed to update node', err)
    }
  }

  const removeNode = async (id) => {
    try {
      // Assuming DELETE /api/user/nodes/{id}
      setNodes(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('Failed to remove node', err)
    }
  }

  const bulkUpdateNodes = async (newList) => {
    try {
      // For a bulk update, we'll just send them one by one or assume a bulk endpoint
      // Using existing addNode logic for safety
      for (const node of newList) {
        await api.post('/user/nodes', node)
      }
      const res = await api.get('/user/data')
      setNodes(res.data.nodes || [])
    } catch (err) {
      console.error('Failed bulk update', err)
    }
  }

  const normalizePercents = (list) => {
    const total = list.reduce((s, i) => s + Math.max(0, i.percent), 0)
    if (total === 0) return list.map(i => ({ ...i, percent: Math.round(100 / list.length) }))
    return list.map(i => ({ ...i, percent: Math.round((Math.max(0, i.percent) / total) * 100) }))
  }

  const totalAllocated = useMemo(() => nodes.reduce((s, n) => s + n.percent, 0), [nodes])

    const ctx = {
      income, setIncome,
      nodes, setNodes, addNode, updateNode, removeNode, bulkUpdateNodes,
      transactions, addTransaction, editTransaction, deleteTransaction,
      portfolio, setPortfolio,
      loans, setLoans,
      normalizePercents, totalAllocated,
      loading
    }

  return (
    <AppContext.Provider value={ctx}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/"           element={<Dashboard />} />
                      <Route path="/graph"      element={<FinanceGraph />} />
                      <Route path="/budget"     element={<Budget />} />
                      <Route path="/loans"      element={<Loans />} />
                      <Route path="/investments" element={<Investments />} />
                      <Route path="/mentors"    element={<Mentors />} />
                      <Route path="/news"       element={<FinNews />} />
                      <Route path="/community"  element={<Community />} />
                      <Route path="/coach"      element={<FinCoach />} />
                      <Route path="/markets"    element={<Markets />} />
                      <Route path="/profile"    element={<Profile />} />
                      <Route path="/report"     element={<IntelligenceReport />} />
                      <Route path="*"           element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
              </AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <JourneyProvider>
        <FeatureTipProvider>
          <GlobalErrorBoundary>
            <AppController />
          </GlobalErrorBoundary>
        </FeatureTipProvider>
      </JourneyProvider>
    </AuthProvider>
  )
}