import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const { setToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    console.log('[Callback] Token from URL:', token ? token.substring(0, 20) + '...' : 'null')
    if (token) {
      setToken(token)
      navigate('/')
    } else {
      console.log('[Callback] No token found, redirecting to login')
      navigate('/login')
    }
  }, [searchParams, setToken, navigate])

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Completing authentication...</p>
    </div>
  )
}
