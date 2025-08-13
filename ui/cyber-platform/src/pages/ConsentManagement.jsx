import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { consentApi } from '../api/mockApi'
import CyberCard from '../components/CyberCard'
import CyberButton from '../components/CyberButton'
import CyberInput from '../components/CyberInput'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  AiOutlinePlus, 
  AiOutlineEdit, 
  AiOutlineDelete,
  AiOutlineUser,
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineWarning,
  AiOutlineClose
} from 'react-icons/ai'
import { BiShieldQuarter } from 'react-icons/bi'

const ConsentManagement = () => {
  const [consents, setConsents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingConsent, setEditingConsent] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const { token } = useAuth()

  const [formData, setFormData] = useState({
    entity: '',
    purpose: '',
    data_principal_id: '',
    scope: [],
    expires_at: null
  })

  useEffect(() => {
    loadConsents()
  }, [])

  const loadConsents = async () => {
    try {
      setLoading(true)
      const data = await consentApi.getConsents(token)
      setConsents(data)
    } catch (error) {
      toast.error('Failed to load consents')
    } finally {
      setLoading(false)
    }
  }

  const openModal = (consent = null) => {
    if (consent) {
      setEditingConsent(consent)
      setFormData({
        entity: consent.entity || '',
        purpose: consent.purpose || '',
        data_principal_id: consent.data_principal_id || '',
        scope: consent.scope || [],
        expires_at: consent.expires_at ? consent.expires_at.split('T')[0] : ''
      })
    } else {
      setEditingConsent(null)
      setFormData({
        entity: '',
        purpose: '',
        data_principal_id: '',
        scope: [],
        expires_at: ''
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingConsent(null)
    setFormData({
      entity: '',
      purpose: '',
      data_principal_id: '',
      scope: [],
      expires_at: ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.entity || !formData.purpose || !formData.data_principal_id) {
      toast.error('Please fill in all required fields')
      return
    }

    setModalLoading(true)
    try {
      const payload = {
        ...formData,
        scope: formData.scope.length > 0 ? formData.scope : ['email'],
        expires_at: formData.expires_at || null
      }

      if (editingConsent) {
        const updated = await consentApi.updateConsent(editingConsent.id, payload, token)
        setConsents(prev => prev.map(c => c.id === editingConsent.id ? updated : c))
        toast.success('Consent updated successfully')
      } else {
        const newConsent = await consentApi.createConsent(payload, token)
        setConsents(prev => [newConsent, ...prev])
        toast.success('Consent created successfully')
      }
      
      closeModal()
    } catch (error) {
      toast.error(`Failed to ${editingConsent ? 'update' : 'create'} consent`)
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async (id, entity) => {
    if (!confirm(`Are you sure you want to delete consent for ${entity}?`)) return

    try {
      await consentApi.deleteConsent(id, token)
      setConsents(prev => prev.filter(c => c.id !== id))
      toast.success('Consent deleted successfully')
    } catch (error) {
      toast.error('Failed to delete consent')
    }
  }

  const getStatusIcon = (status) => {
    if (!status) return AiOutlineWarning
    switch (status.toLowerCase()) {
      case 'active': return AiOutlineCheckCircle
      case 'pending': return AiOutlineClockCircle
      default: return AiOutlineWarning
    }
  }

  const getStatusColor = (status) => {
    if (!status) return 'text-cyber-gray'
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      default: return 'text-red-400'
    }
  }

  const toggleScope = (scopeItem) => {
    setFormData(prev => ({
      ...prev,
      scope: prev.scope.includes(scopeItem)
        ? prev.scope.filter(item => item !== scopeItem)
        : [...prev.scope, scopeItem]
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading consents..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-4xl font-orbitron font-bold glow-text mb-2">
            Consent Management
          </h1>
          <p className="text-cyber-gray">
            Manage user consents and privacy preferences with GDPR compliance
          </p>
        </div>
        
        <CyberButton onClick={() => openModal()}>
          <AiOutlinePlus />
          New Consent
        </CyberButton>
      </motion.div>

      {/* Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {[
          { 
            label: 'Total Consents', 
            value: consents.length, 
            icon: BiShieldQuarter,
            color: 'from-cyber-cyan to-cyber-blue'
          },
          { 
            label: 'Active', 
            value: consents.filter(c => c.status === 'Active').length, 
            icon: AiOutlineCheckCircle,
            color: 'from-green-400 to-emerald-500'
          },
          { 
            label: 'Pending', 
            value: consents.filter(c => c.status === 'Pending').length, 
            icon: AiOutlineClockCircle,
            color: 'from-yellow-400 to-orange-500'
          }
        ].map((stat, index) => (
          <CyberCard key={stat.label} className="text-center">
            <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
              <stat.icon className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-orbitron font-bold text-white mb-1">
              {stat.value}
            </h3>
            <p className="text-cyber-gray text-sm">{stat.label}</p>
          </CyberCard>
        ))}
      </motion.div>

      {/* Consents Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <CyberCard>
          <h3 className="text-xl font-orbitron font-bold text-cyber-cyan mb-6">
            Active Consents
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyber-cyan/30">
                  <th className="text-left py-3 px-4 text-cyber-gray font-medium">Entity</th>
                  <th className="text-left py-3 px-4 text-cyber-gray font-medium">Purpose</th>
                  <th className="text-left py-3 px-4 text-cyber-gray font-medium">User ID</th>
                  <th className="text-left py-3 px-4 text-cyber-gray font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-cyber-gray font-medium">Scope</th>
                  <th className="text-right py-3 px-4 text-cyber-gray font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {consents.map((consent, index) => {
                  const statusText = consent.status ?? (consent.active ? 'Active' : 'Inactive')
                  const StatusIcon = getStatusIcon(statusText)
                  return (
                    <motion.tr
                      key={consent.id}
                      className="border-b border-cyber-cyan/10 hover:bg-cyber-cyan/5 transition-colors duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-lg flex items-center justify-center">
                            <BiShieldQuarter className="text-white text-sm" />
                          </div>
                          <span className="text-white font-medium">{consent.entity || '—'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-cyber-gray">{consent.purpose}</td>
                      <td className="py-4 px-4 text-cyber-gray">{consent.data_principal_id}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`${getStatusColor(statusText)}`} />
                          <span className={`text-sm font-medium ${getStatusColor(statusText)}`}>
                            {statusText}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {consent.scope?.slice(0, 2).map(item => (
                            <span key={item} className="px-2 py-1 bg-cyber-cyan/20 text-cyber-cyan rounded text-xs">
                              {item}
                            </span>
                          ))}
                          {consent.scope?.length > 2 && (
                            <span className="px-2 py-1 bg-cyber-gray/20 text-cyber-gray rounded text-xs">
                              +{consent.scope.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end space-x-2">
                          <motion.button
                            onClick={() => openModal(consent)}
                            className="p-2 text-cyber-blue hover:bg-cyber-blue/20 rounded-lg transition-colors duration-300"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <AiOutlineEdit />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDelete(consent.id, consent.entity)}
                            className="p-2 text-cyber-pink hover:bg-cyber-pink/20 rounded-lg transition-colors duration-300"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <AiOutlineDelete />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CyberCard>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-cyber-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-cyber-navy border border-cyber-cyan/30 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-orbitron font-bold text-cyber-cyan">
                  {editingConsent ? 'Edit Consent' : 'Create New Consent'}
                </h3>
                <motion.button
                  onClick={closeModal}
                  className="p-2 text-cyber-gray hover:text-cyber-cyan transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <AiOutlineClose />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <CyberInput
                  label="Entity/Organization"
                  value={formData.entity}
                  onChange={(e) => setFormData(prev => ({ ...prev, entity: e.target.value }))}
                  placeholder="Bank of Cyber"
                  required
                />

                <CyberInput
                  label="Purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  placeholder="Fraud Detection"
                  required
                />

                <CyberInput
                  label="User ID"
                  value={formData.data_principal_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_principal_id: e.target.value }))}
                  placeholder="user-123"
                  icon={AiOutlineUser}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-cyber-gray mb-3">
                    Data Scope
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['email', 'profile', 'financial_data', 'transaction_data', 'log_data', 'network_activity'].map(scope => (
                      <motion.button
                        key={scope}
                        type="button"
                        onClick={() => toggleScope(scope)}
                        className={`p-2 rounded-lg border text-sm transition-all duration-300 ${
                          formData.scope.includes(scope)
                            ? 'border-cyber-cyan bg-cyber-cyan/20 text-cyber-cyan'
                            : 'border-cyber-cyan/30 text-cyber-gray hover:border-cyber-cyan/60'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {scope.replace('_', ' ')}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <CyberInput
                  label="Expiry Date (Optional)"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                />

                <div className="flex space-x-3 pt-4">
                  <CyberButton
                    type="submit"
                    loading={modalLoading}
                    className="flex-1"
                  >
                    {editingConsent ? 'Update' : 'Create'} Consent
                  </CyberButton>
                  <CyberButton
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    disabled={modalLoading}
                  >
                    Cancel
                  </CyberButton>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ConsentManagement
