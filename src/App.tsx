import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import Workspace from '@/pages/Workspace'
import Results from '@/pages/Results'
import RequireAuth from '@/components/RequireAuth'

export default function App() {
  return (
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
  )
}
