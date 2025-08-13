import { motion } from 'framer-motion'
import { useState } from 'react'

const CyberButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  className = '',
  ...props 
}) => {
  const [ripples, setRipples] = useState([])

  const handleClick = (e) => {
    if (disabled || loading) return

    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    
    const newRipple = {
      x,
      y,
      size,
      id: Date.now()
    }

    setRipples(prev => [...prev, newRipple])
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)

    onClick?.(e)
  }

  const variants = {
    primary: 'bg-gradient-to-r from-cyber-cyan to-cyber-blue text-cyber-dark hover:shadow-cyber-cyan/50',
    secondary: 'bg-gradient-to-r from-cyber-blue to-cyber-purple text-white hover:shadow-cyber-blue/50',
    danger: 'bg-gradient-to-r from-cyber-pink to-red-500 text-white hover:shadow-cyber-pink/50',
    outline: 'border-2 border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-cyber-dark'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <motion.button
      className={`
        relative overflow-hidden font-semibold rounded-lg transition-all duration-300 
        hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      {...props}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/20 rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}

      {/* Loading spinner */}
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}

      {/* Button content */}
      <span className={`relative z-10 flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 transition-opacity duration-300"
        whileHover={{ opacity: disabled ? 0 : 1 }}
      />
    </motion.button>
  )
}

export default CyberButton
