import { motion } from 'framer-motion'
import { useState } from 'react'

const CyberInput = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error,
  icon: Icon,
  masked = false,
  className = '',
  ...props 
}) => {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className={`relative ${className}`}>
      {label && (
        <motion.label 
          className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
            focused ? 'text-cyber-cyan' : 'text-cyber-gray'
          }`}
          animate={{ color: focused ? '#00FFC6' : '#8B8E98' }}
        >
          {label}
        </motion.label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
            focused ? 'text-cyber-cyan' : 'text-cyber-gray'
          }`}>
            <Icon size={20} />
          </div>
        )}
        
        <motion.input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            cyber-input w-full
            ${Icon ? 'pl-12' : ''}
            ${type === 'password' ? 'pr-12' : ''}
            ${error ? 'border-cyber-pink focus:border-cyber-pink focus:ring-cyber-pink/20' : ''}
          `}
          whileFocus={{ 
            boxShadow: '0 0 20px rgba(0, 255, 198, 0.3)',
            borderColor: '#00FFC6'
          }}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyber-gray hover:text-cyber-cyan transition-colors duration-300"
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        )}

        {/* Scanning line effect for focused state */}
        {focused && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: 'linear' 
              }}
            />
          </motion.div>
        )}
      </div>
      
      {error && (
        <motion.p 
          className="mt-1 text-sm text-cyber-pink"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

export default CyberInput
