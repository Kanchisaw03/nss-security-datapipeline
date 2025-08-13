import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/mockApi'
import CyberButton from '../components/CyberButton'
import CyberInput from '../components/CyberInput'
import CyberCard from '../components/CyberCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { AiOutlineLock, AiOutlineKey } from 'react-icons/ai'
import { BiShieldQuarter } from 'react-icons/bi'

const Login = () => {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [scanActive, setScanActive] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token.trim()) {
      toast.error('Please enter a token')
      return
    }

    setLoading(true)
    setScanActive(true)

    try {
      // Simulate cyber scanning animation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const result = await login(token)
      if (result.success) {
        toast.success('Authentication successful! Welcome to CyberShield.')
        navigate('/dashboard')
      } else {
        toast.error(result.error || 'Authentication failed')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
      setScanActive(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyber-cyan to-cyber-blue rounded-full mb-4"
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(0, 255, 198, 0.5)',
                '0 0 40px rgba(0, 255, 198, 0.8)',
                '0 0 20px rgba(0, 255, 198, 0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <BiShieldQuarter className="text-3xl text-cyber-dark" />
          </motion.div>
          <h1 className="text-4xl font-orbitron font-bold glow-text mb-2">CyberShield</h1>
          <p className="text-cyber-gray">Secure Data Privacy Platform</p>
        </motion.div>

        {/* Login Form */}
        <CyberCard glow className="relative overflow-hidden">
          {/* Scanning animation overlay */}
          {scanActive && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-cyan/20 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ zIndex: 10 }}
            />
          )}

          <div className="space-y-6 relative z-20">
            <div className="text-center">
              <h2 className="text-2xl font-orbitron font-bold text-cyber-cyan mb-2">
                Authenticate Access
              </h2>
              <p className="text-cyber-gray text-sm">
                Enter your security token to access the platform
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <CyberInput
                label="Security Token"
                type="password"
                placeholder="Enter your authentication token..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                icon={AiOutlineKey}
                className="relative"
              />

              <CyberButton
                type="submit"
                loading={loading}
                disabled={!token.trim()}
                className="w-full"
                size="lg"
              >
                <AiOutlineLock className="text-xl" />
                {loading ? 'Authenticating...' : 'Authenticate'}
              </CyberButton>
            </form>

            {/* Demo instructions */}
            <motion.div 
              className="border-t border-cyber-cyan/20 pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p className="text-xs text-cyber-gray text-center mb-2">Demo Mode</p>
              <p className="text-xs text-cyber-gray/70 text-center">
                Use any token with 10+ characters for demo access
              </p>
            </motion.div>
          </div>

          {/* Loading overlay */}
          {loading && (
            <motion.div
              className="absolute inset-0 bg-cyber-dark/80 backdrop-blur-sm flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ zIndex: 30 }}
            >
              <LoadingSpinner 
                size="lg" 
                text="Scanning quantum encryption..."
              />
            </motion.div>
          )}
        </CyberCard>

        {/* Features */}
        <motion.div 
          className="mt-8 grid grid-cols-3 gap-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {[
            { icon: BiShieldQuarter, label: 'Secure' },
            { icon: AiOutlineLock, label: 'Encrypted' },
            { icon: AiOutlineKey, label: 'Verified' }
          ].map((feature, index) => (
            <motion.div
              key={feature.label}
              className="p-3 bg-cyber-navy/30 rounded-lg border border-cyber-cyan/20"
              whileHover={{ scale: 1.05, borderColor: '#00FFC6' }}
              transition={{ delay: index * 0.1 }}
            >
              <feature.icon className="text-cyber-cyan text-xl mx-auto mb-1" />
              <p className="text-xs text-cyber-gray">{feature.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default Login
