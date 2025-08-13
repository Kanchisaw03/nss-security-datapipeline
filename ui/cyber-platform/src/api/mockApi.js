import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Point to your backend
  timeout: 10000,
})

// Mock delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Mock data
export const mockConsents = [
  { 
    id: 1, 
    entity: 'Bank of Cyber', 
    purpose: 'Fraud Detection', 
    status: 'Active',
    data_principal_id: 'user-123',
    scope: ['email', 'transaction_data'],
    created_at: '2024-01-15T10:30:00Z',
    expires_at: null
  },
  { 
    id: 2, 
    entity: 'DataSecure Ltd', 
    purpose: 'Risk Analysis', 
    status: 'Pending',
    data_principal_id: 'user-456',
    scope: ['profile', 'financial_data'],
    created_at: '2024-01-16T14:20:00Z',
    expires_at: '2024-12-31T23:59:59Z'
  },
  { 
    id: 3, 
    entity: 'CyberInsight Corp', 
    purpose: 'Security Monitoring', 
    status: 'Active',
    data_principal_id: 'user-789',
    scope: ['log_data', 'network_activity'],
    created_at: '2024-01-17T09:15:00Z',
    expires_at: null
  }
]

// API functions
export const authApi = {
  validateToken: async (token) => {
    await delay(1500) // Simulate network delay
    if (token && token.length > 10) {
      return { success: true, user: { name: 'Cyber Agent', role: 'Security Analyst' } }
    }
    throw new Error('Invalid token')
  }
}

export const dataApi = {
  ingestData: async (data, token) => {
    await delay(2000)
    // Try to hit the real backend first
    try {
      const response = await api.post('/ingest', data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      // Fallback to mock response
      return {
        success: true,
        recordId: `rec_${Date.now()}`,
        message: 'Data ingested successfully (mock)',
        timestamp: new Date().toISOString()
      }
    }
  },

  uploadFile: async (file, token) => {
    await delay(3000)
    return {
      success: true,
      fileId: `file_${Date.now()}`,
      fileName: file.name,
      size: file.size,
      message: 'File uploaded and processed successfully'
    }
  }
}

export const consentApi = {
  getConsents: async (token, { dpid, purpose } = {}) => {
    await delay(400)
    try {
      const response = await api.get('/consents', {
        headers: { Authorization: `Bearer ${token}` },
        params: { dpid, purpose }
      })
      return response.data
    } catch (error) {
      return mockConsents
    }
  },

  createConsent: async (consentData, token) => {
    await delay(1500)
    try {
      const response = await api.post('/consents', consentData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      // Fallback to mock
      const newConsent = {
        id: Date.now(),
        ...consentData,
        status: 'Active',
        created_at: new Date().toISOString()
      }
      mockConsents.push(newConsent)
      return newConsent
    }
  },

  updateConsent: async (id, updates, token) => {
    await delay(500)
    try {
      const response = await api.patch(`/consents/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      const index = mockConsents.findIndex(c => c.id === id)
      if (index !== -1) {
        mockConsents[index] = { ...mockConsents[index], ...updates }
        return mockConsents[index]
      }
      throw new Error('Consent not found')
    }
  },

  deleteConsent: async (id, token) => {
    await delay(1000)
    try {
      await api.delete(`/consents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return { success: true }
    } catch (error) {
      // Fallback to mock
      const index = mockConsents.findIndex(c => c.id === id)
      if (index !== -1) {
        mockConsents.splice(index, 1)
        return { success: true }
      }
      throw new Error('Consent not found')
    }
  }
}

export const securityApi = {
  getSecurityLogs: async () => {
    await delay(800)
    return [
      { id: 1, type: 'AUTH', message: 'User login successful', timestamp: '2024-01-20T10:30:00Z', severity: 'INFO' },
      { id: 2, type: 'DATA', message: 'Data ingestion completed', timestamp: '2024-01-20T10:25:00Z', severity: 'SUCCESS' },
      { id: 3, type: 'CONSENT', message: 'Consent created for user-123', timestamp: '2024-01-20T10:20:00Z', severity: 'INFO' },
      { id: 4, type: 'SECURITY', message: 'Suspicious activity detected', timestamp: '2024-01-20T10:15:00Z', severity: 'WARNING' },
      { id: 5, type: 'SYSTEM', message: 'System backup completed', timestamp: '2024-01-20T10:10:00Z', severity: 'SUCCESS' }
    ]
  },

  getThreatMap: async () => {
    await delay(1200)
    return [
      { id: 1, country: 'Russia', threats: 45, lat: 61.5240, lng: 105.3188 },
      { id: 2, country: 'China', threats: 32, lat: 35.8617, lng: 104.1954 },
      { id: 3, country: 'North Korea', threats: 28, lat: 40.3399, lng: 127.5101 },
      { id: 4, country: 'Iran', threats: 19, lat: 32.4279, lng: 53.6880 },
      { id: 5, country: 'Unknown', threats: 67, lat: 0, lng: 0 }
    ]
  }
}
