import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import Login from '@/pages/Login'
import Workspace from '@/pages/Workspace'
import Results from '@/pages/Results'
import RequireAuth from '@/components/RequireAuth'

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          className: 'font-sans',
          style: {
            background: '#1a2332',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="/login" element={<Login initialMode="login" />} />
          <Route path="/signup" element={<Login initialMode="register" />} />
          <Route
            path="/app"
            element={
              <RequireAuth>
                <Workspace />
              </RequireAuth>
            }
          />
          <Route
            path="/results/:runId"
            element={
              <RequireAuth>
                <Results />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </Router>
    </>
  )
}
