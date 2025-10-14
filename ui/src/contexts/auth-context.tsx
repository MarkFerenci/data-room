import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { api, type User } from '@/lib/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  setToken: (token: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const token = localStorage.getItem('auth_token')
      console.log('[Auth] Checking auth, token exists:', !!token)
      if (token) {
        console.log('[Auth] Token:', token.substring(0, 20) + '...')
        const response = await api.getCurrentUser()
        console.log('[Auth] User fetched successfully:', response.user)
        setUser(response.user)
      }
    } catch (error) {
      console.error('[Auth] Auth check failed:', error)
      localStorage.removeItem('auth_token')
    } finally {
      setLoading(false)
    }
  }

  async function login() {
    const response = await api.getLoginUrl()
    window.location.href = response.auth_url
  }

  async function logout() {
    await api.logout()
    setUser(null)
  }

  function setToken(token: string) {
    console.log('[Auth] Setting token:', token.substring(0, 20) + '...')
    localStorage.setItem('auth_token', token)
    checkAuth()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
