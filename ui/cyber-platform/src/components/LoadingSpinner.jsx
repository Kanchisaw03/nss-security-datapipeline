import { motion } from 'framer-motion'

const LoadingSpinner = ({ size = 'md', text, className = '' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        className={`${sizes[size]} relative`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-cyber-cyan/20 rounded-full" />
        
        {/* Spinning arc */}
        <div className="absolute inset-0 border-4 border-transparent border-t-cyber-cyan rounded-full animate-spin" />
        
        {/* Inner glow */}
        <div className="absolute inset-2 bg-cyber-cyan/10 rounded-full animate-pulse" />
        
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyber-cyan rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </motion.div>
      
      {text && (
        <motion.p 
          className="mt-4 text-cyber-cyan text-sm font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

export default LoadingSpinner
