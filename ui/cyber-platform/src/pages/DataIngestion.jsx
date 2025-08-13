import { useState } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { dataApi } from '../api/mockApi'
import CyberCard from '../components/CyberCard'
import CyberButton from '../components/CyberButton'
import CyberInput from '../components/CyberInput'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  AiOutlineCloudUpload, 
  AiOutlineFileText, 
  AiOutlineCheckCircle,
  AiOutlineWarning,
  AiOutlineUser,
  AiOutlineCalendar
} from 'react-icons/ai'

const DataIngestion = () => {
  const [textData, setTextData] = useState('')
  const [userId, setUserId] = useState('user-123')
  const [purpose, setPurpose] = useState('research')
  const [dateOfBirth, setDateOfBirth] = useState('1990-01-01')
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [results, setResults] = useState([])
  const { token } = useAuth()

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setLoading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 20
        })
      }, 200)

      const result = await dataApi.uploadFile(file, token)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      setResults(prev => [{
        id: Date.now(),
        type: 'file',
        fileName: file.name,
        size: file.size,
        result: result,
        timestamp: new Date().toISOString()
      }, ...prev])

      toast.success(`File "${file.name}" uploaded successfully!`)
    } catch (error) {
      toast.error('Upload failed: ' + error.message)
    } finally {
      setLoading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      'text/plain': ['.txt'],
      'application/json': ['.json'],
      'text/csv': ['.csv']
    }
  })

  const handleTextIngestion = async () => {
    if (!textData.trim()) {
      toast.error('Please enter some data to ingest')
      return
    }

    setLoading(true)
    try {
      const payload = {
        data_principal_id: userId,
        purpose: purpose,
        date_of_birth: dateOfBirth,
        payload: {
          email: textData.includes('@') ? textData : `${userId}@example.com`,
          data: textData
        }
      }

      const result = await dataApi.ingestData(payload, token)
      
      setResults(prev => [{
        id: Date.now(),
        type: 'text',
        data: textData,
        result: result,
        timestamp: new Date().toISOString()
      }, ...prev])

      toast.success('Data ingested successfully!')
      setTextData('')
    } catch (error) {
      toast.error('Ingestion failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
          Data Ingestion
        </h1>
        <p className="text-cyber-gray">
          Securely upload and process data with automated privacy compliance
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <CyberCard>
            <h3 className="text-xl font-orbitron font-bold text-cyber-cyan mb-6">
              Ingestion Parameters
            </h3>
            
            <div className="space-y-4">
              <CyberInput
                label="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                icon={AiOutlineUser}
                placeholder="user-123"
              />
              
              <CyberInput
                label="Purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="research, analytics, etc."
              />
              
              <CyberInput
                label="Date of Birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                icon={AiOutlineCalendar}
              />
            </div>
          </CyberCard>
        </motion.div>

        {/* File Upload */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <CyberCard>
            <h3 className="text-xl font-orbitron font-bold text-cyber-cyan mb-6">
              File Upload
            </h3>
            
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
                ${isDragActive 
                  ? 'border-cyber-cyan bg-cyber-cyan/10' 
                  : 'border-cyber-cyan/30 hover:border-cyber-cyan/60 hover:bg-cyber-cyan/5'
                }
              `}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={{ 
                  scale: isDragActive ? 1.1 : 1,
                  rotate: isDragActive ? 5 : 0
                }}
                transition={{ duration: 0.3 }}
              >
                <AiOutlineCloudUpload className="text-4xl text-cyber-cyan mx-auto mb-4" />
              </motion.div>
              
              {isDragActive ? (
                <p className="text-cyber-cyan font-medium">Drop files here...</p>
              ) : (
                <div>
                  <p className="text-white font-medium mb-2">
                    Drag & drop files here, or click to select
                  </p>
                  <p className="text-cyber-gray text-sm">
                    Supports: TXT, JSON, CSV (max 10MB)
                  </p>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <motion.div
                className="mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-cyber-gray">Uploading...</span>
                  <span className="text-cyber-cyan">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-cyber-navy rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-cyber-cyan to-cyber-blue h-2 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )}
          </CyberCard>
        </motion.div>
      </div>

      {/* Text Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <CyberCard>
          <h3 className="text-xl font-orbitron font-bold text-cyber-cyan mb-6">
            Manual Data Entry
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cyber-gray mb-2">
                Data Content
              </label>
              <textarea
                value={textData}
                onChange={(e) => setTextData(e.target.value)}
                placeholder="Enter data to ingest (e.g., user email, profile data, etc.)"
                className="cyber-input w-full h-32 resize-none"
              />
            </div>
            
            <CyberButton
              onClick={handleTextIngestion}
              loading={loading}
              disabled={!textData.trim()}
              className="w-full"
            >
              <AiOutlineFileText />
              Ingest Data
            </CyberButton>
          </div>
        </CyberCard>
      </motion.div>

      {/* Results */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <CyberCard>
            <h3 className="text-xl font-orbitron font-bold text-cyber-cyan mb-6">
              Ingestion Results
            </h3>
            
            <div className="space-y-4">
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  className="p-4 bg-cyber-navy/30 rounded-lg border border-cyber-cyan/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <AiOutlineCheckCircle className="text-green-400" />
                        <span className="text-white font-medium">
                          {result.type === 'file' ? 'File Upload' : 'Text Ingestion'}
                        </span>
                        <span className="text-cyber-gray text-sm">
                          {new Date(result.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      {result.type === 'file' ? (
                        <div className="text-sm text-cyber-gray">
                          <p>File: {result.fileName}</p>
                          <p>Size: {formatFileSize(result.size)}</p>
                          <p>ID: {result.result.fileId}</p>
                        </div>
                      ) : (
                        <div className="text-sm text-cyber-gray">
                          <p>Record ID: {result.result.recordId}</p>
                          <p>Data: {result.data.substring(0, 50)}...</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <span className="px-3 py-1 bg-green-400/20 text-green-400 rounded-full text-xs font-medium">
                        Success
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CyberCard>
        </motion.div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <motion.div
          className="fixed inset-0 bg-cyber-dark/80 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <LoadingSpinner 
            size="lg" 
            text="Processing data through privacy pipeline..."
          />
        </motion.div>
      )}
    </div>
  )
}

export default DataIngestion
