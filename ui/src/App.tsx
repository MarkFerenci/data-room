import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/auth-context'
import { LoginPage } from './pages/login-page'
import { AuthCallbackPage } from './pages/auth-callback-page'
import { DashboardPage } from './pages/dashboard-page'
import { DataroomPage } from './pages/dataroom-page'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dataroom/:id" element={<DataroomPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
