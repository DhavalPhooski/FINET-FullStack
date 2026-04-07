import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Wallet, Mail, Lock, User, ArrowRight, Loader2, Sparkles } from 'lucide-react'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password, fullName)
      }
      navigate('/')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Legacy auth removed. Setup Supabase first.')
    } finally {
      setLoading(false)
    }
  }

  const toggleAuth = () => {
    setIsLogin(!isLogin)
    setError(null)
  }

  return (
    <div className="auth-shell" style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent), radial-gradient(circle at bottom left, rgba(79, 70, 229, 0.1), transparent), #09090b',
      color: '#fff',
      fontFamily: 'Outfit, sans-serif'
    }}>
      <div className="auth-info" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 80px',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'absolute', top: '20%', left: '-10%', 
          width: '300px', height: '300px', 
          background: 'rgba(99, 102, 241, 0.4)', 
          filter: 'blur(120px)', zIndex: 0 
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 
          }}>
            <div style={{ 
              width: 44, height: 44, borderRadius: 12, 
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(79, 70, 229, 0.3)'
            }}>
              <Wallet size={24} color="#fff" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>FINET</h1>
          </div>
          
          <h2 style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.03em' }}>
            Supabase Auth <span style={{ color: '#818cf8', fontWeight: 800 }}>Ready</span>
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: 480, marginBottom: 40 }}>
            Legacy login/register has been removed. Continue with the Supabase integration in `SUPABASE_AUTH_CHECKLIST.md`.
          </p>

          <div className="feature-list" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
             {[
               { icon: Sparkles, text: 'Supabase email/password login' },
               { icon: ArrowRight, text: 'Secure session management' },
             ].map((item, i) => (
               <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>
                 <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <item.icon size={14} color="#818cf8" />
                 </div>
                 {item.text}
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="auth-card-wrapper" style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div className="auth-card" style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '48px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
          position: 'relative'
        }}>
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 8 }}>
              {isLogin ? 'Login' : 'Create Account'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
              {isLogin ? 'This page is ready for Supabase auth wiring.' : 'Registering will be linked to Supabase once configured.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {!isLogin && (
              <div className="input-group">
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: '100%', padding: '14px 14px 14px 48px', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: '0.95rem',
                      outline: 'none', transition: 'border-color 0.2s'
                    }}
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 14px 14px 48px', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: '0.95rem',
                    outline: 'none', transition: 'border-color 0.2s'
                  }}
                />
              </div>
            </div>

            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Password</label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 14px 14px 48px', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: '0.95rem',
                    outline: 'none', transition: 'border-color 0.2s'
                  }}
                />
              </div>
            </div>

            {error && <div style={{ color: '#f87171', fontSize: '0.82rem', textAlign: 'center' }}>{error}</div>}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 12, padding: '14px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#fff', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'transform 0.1s, opacity 0.2s',
                opacity: loading ? 0.7 : 1
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1.5s linear infinite' }} /> : (isLogin ? 'Login →' : 'Create Account →')}
            </button>
          </form>

          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)' }}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={toggleAuth}
                style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');

        .auth-shell {
          width: 100%;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          overflow: hidden;
        }

        .auth-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 80px;
          border-right: 1px solid rgba(255,255,255,0.06);
          position: relative;
          overflow: hidden;
        }

        .auth-card-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 32px 64px rgba(0,0,0,0.4);
          position: relative;
        }

        .auth-info h2 {
          font-size: 3rem;
        }

        .auth-info p {
          max-width: 480px;
        }

        @media (max-width: 880px) {
          .auth-shell {
            display: block;
          }

          .auth-info {
            padding: 42px 24px 30px;
            border-right: none;
            border-bottom: 1px solid rgba(255,255,255,0.08);
          }

          .auth-card-wrapper {
            padding: 24px 18px 36px;
          }

          .auth-card {
            padding: 32px;
            border-radius: 22px;
          }

          .auth-info h2 {
            font-size: 2.2rem;
          }

          .auth-info p {
            max-width: 100%;
          }

          .feature-list {
            gap: 16px;
          }

          .auth-card form {
            gap: 16px;
          }

          button[type="submit"] {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

