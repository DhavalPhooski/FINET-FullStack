import { useState, useEffect, useContext, createContext } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

const formatUser = (user) => {
  if (!user) return null
  const name = user.user_metadata?.full_name || user.full_name || (user.email ? user.email.split('@')[0] : 'Protocol User')
  const phone = user.user_metadata?.phone || user.phone || 'Private'
  const location = user.user_metadata?.location || user.user_metadata?.place || ''
  return {
    ...user,
    full_name: name,
    phone,
    location,
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setUser(formatUser(data?.session?.user ?? null))
      setLoading(false)
    }

    initAuth()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      setUser(formatUser(session?.user ?? null))
    })

    return () => {
      mounted = false
      listener.subscription?.unsubscribe()
    }
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error)
      throw error
    }
    setUser(formatUser(data.user))
    return data.user
  }

  const register = async (email, password, fullName) => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || undefined,
        },
      },
    })
    setLoading(false)
    if (error) {
      setError(error)
      throw error
    }
    setUser(formatUser(data.user))
    return data.user
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
