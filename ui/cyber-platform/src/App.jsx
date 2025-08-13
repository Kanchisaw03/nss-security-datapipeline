import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DataIngestion from './pages/DataIngestion'
import ConsentManagement from './pages/ConsentManagement'
import Layout from './components/Layout'
import MatrixBackground from './components/MatrixBackground'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-cyber-dark">
        <MatrixBackground />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/data-ingestion" element={
            <ProtectedRoute>
              <Layout>
                <DataIngestion />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/consent-management" element={
            <ProtectedRoute>
              <Layout>
                <ConsentManagement />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
