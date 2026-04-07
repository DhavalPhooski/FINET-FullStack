import axios from 'axios'
import { supabase } from '../lib/supabaseClient'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  console.log('[API Interceptor] Token:', token ? `✓ present (${token.substring(0, 20)}...)` : '✗ missing')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    console.warn('[API Interceptor] No token found - user may not be logged in')
  }
  return config
}, (error) => Promise.reject(error))

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await supabase.auth.signOut()
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth'
      }
    }
    return Promise.reject(error)
  }
)

export default api
