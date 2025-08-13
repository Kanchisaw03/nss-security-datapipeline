import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  const login = async (tokenValue) => {
    // Mock token validation
    if (tokenValue && tokenValue.length > 10) {
      setIsAuthenticated(true)
      setToken(tokenValue)
      setUser({
        id: 1,
        name: 'Cyber Agent',
        email: 'agent@cybershield.com',
        role: 'Security Analyst'
      })
      return { success: true }
    }
    return { success: false, error: 'Invalid token' }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    setToken(null)
  }

  const value = {
    isAuthenticated,
    user,
    token,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
