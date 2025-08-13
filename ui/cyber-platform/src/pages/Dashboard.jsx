import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import CyberCard from '../components/CyberCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { securityApi } from '../api/mockApi'
import { 
  AiOutlineCloudUpload, 
  AiOutlineFileText,
  AiOutlineWarning,
  AiOutlineCheckCircle,
  AiOutlineInfoCircle,
  AiOutlineGlobal
} from 'react-icons/ai'
import { BiShieldQuarter } from 'react-icons/bi'

const Dashboard = () => {
  const [securityLogs, setSecurityLogs] = useState([])
  const [threatMap, setThreatMap] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalIngested: 1247,
    activeConsents: 23,
    threatLevel: 'Medium',
    systemStatus: 'Online'
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [logs, threats] = await Promise.all([
        securityApi.getSecurityLogs(),
        securityApi.getThreatMap()
      ])
      setSecurityLogs(logs)
      setThreatMap(threats)
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'SUCCESS': return 'text-green-400'
      case 'WARNING': return 'text-yellow-400'
      case 'ERROR': return 'text-red-400'
      default: return 'text-cyber-cyan'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'SUCCESS': return AiOutlineCheckCircle
      case 'WARNING': return AiOutlineWarning
      case 'ERROR': return AiOutlineWarning
      default: return AiOutlineInfoCircle
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-orbitron font-bold glow-text mb-2">
          Security Dashboard
        </h1>
        <p className="text-cyber-gray">
          Monitor data flows, consents, and security events in real-time
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {[
          { 
            label: 'Data Records', 
            value: stats.totalIngested.toLocaleString(), 
            icon: AiOutlineFileText,
            gradient: 'from-cyber-cyan to-cyber-blue'
          },
          { 
            label: 'Active Consents', 
            value: stats.activeConsents, 
            icon: BiShieldQuarter,
            gradient: 'from-cyber-blue to-cyber-purple'
          },
          { 
            label: 'Threat Level', 
            value: stats.threatLevel, 
            icon: AiOutlineWarning,
            gradient: 'from-yellow-400 to-orange-500'
          },
          { 
            label: 'System Status', 
            value: stats.systemStatus, 
            icon: AiOutlineCheckCircle,
            gradient: 'from-green-400 to-emerald-500'
          }
        ].map((stat, index) => (
          <CyberCard key={stat.label} className="text-center">
            <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-lg flex items-center justify-center mx-auto mb-4`}>
              <stat.icon className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-orbitron font-bold text-white mb-1">
              {stat.value}
            </h3>
            <p className="text-cyber-gray text-sm">{stat.label}</p>
          </CyberCard>
        ))}
      </motion.div>

      {/* Main Actions */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Link to="/data-ingestion">
          <CyberCard hover glow className="h-full group cursor-pointer">
            <div className="text-center p-6">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-r from-cyber-cyan to-cyber-blue rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: 5 }}
              >
                <AiOutlineCloudUpload className="text-cyber-dark text-3xl" />
              </motion.div>
              <h3 className="text-xl font-orbitron font-bold text-cyber-cyan mb-2">
                Data Ingestion
              </h3>
              <p className="text-cyber-gray text-sm mb-4">
                Upload and process data with automated privacy compliance
              </p>
              <div className="inline-flex items-center text-cyber-cyan text-sm">
                <span>Start Ingestion</span>
                <motion.span 
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </div>
            </div>
          </CyberCard>
        </Link>

        <Link to="/consent-management">
          <CyberCard hover glow className="h-full group cursor-pointer">
            <div className="text-center p-6">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: -5 }}
              >
                <BiShieldQuarter className="text-white text-3xl" />
              </motion.div>
              <h3 className="text-xl font-orbitron font-bold text-cyber-blue mb-2">
                Consent Management
              </h3>
              <p className="text-cyber-gray text-sm mb-4">
                Manage user consents and privacy preferences
              </p>
              <div className="inline-flex items-center text-cyber-blue text-sm">
                <span>Manage Consents</span>
                <motion.span 
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                >
                  →
                </motion.span>
              </div>
            </div>
          </CyberCard>
        </Link>

        <CyberCard className="h-full">
          <div className="text-center p-6">
            <motion.div 
              className="w-16 h-16 bg-gradient-to-r from-cyber-pink to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4"
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(255, 0, 168, 0.5)',
                  '0 0 40px rgba(255, 0, 168, 0.8)',
                  '0 0 20px rgba(255, 0, 168, 0.5)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AiOutlineGlobal className="text-white text-3xl" />
            </motion.div>
            <h3 className="text-xl font-orbitron font-bold text-cyber-pink mb-2">
              Threat Monitor
            </h3>
            <p className="text-cyber-gray text-sm mb-4">
              Real-time global threat detection and analysis
            </p>
            <div className="space-y-2">
              {threatMap.slice(0, 3).map((threat, index) => (
                <div key={threat.id} className="flex justify-between items-center text-xs">
                  <span className="text-cyber-gray">{threat.country}</span>
                  <span className="text-cyber-pink font-medium">{threat.threats} threats</span>
                </div>
              ))}
            </div>
          </div>
        </CyberCard>
      </motion.div>

      {/* Security Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <CyberCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-orbitron font-bold text-cyber-cyan">
              Recent Security Events
            </h3>
            <motion.button
              onClick={loadDashboardData}
              className="text-cyber-gray hover:text-cyber-cyan transition-colors duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ↻ Refresh
            </motion.button>
          </div>
          
          <div className="space-y-3">
            {securityLogs.map((log, index) => {
              const SeverityIcon = getSeverityIcon(log.severity)
              return (
                <motion.div
                  key={log.id}
                  className="flex items-center space-x-4 p-3 bg-cyber-navy/30 rounded-lg border border-cyber-cyan/20 hover:border-cyber-cyan/40 transition-colors duration-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SeverityIcon className={`text-lg ${getSeverityColor(log.severity)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{log.message}</p>
                    <p className="text-cyber-gray text-xs">
                      {log.type} • {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(log.severity)} bg-current bg-opacity-10`}>
                    {log.severity}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </CyberCard>
      </motion.div>
    </div>
  )
}

export default Dashboard
