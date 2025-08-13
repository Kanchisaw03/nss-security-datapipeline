import { motion } from 'framer-motion'

const CyberCard = ({ 
  children, 
  className = '', 
  hover = true, 
  glow = false,
  ...props 
}) => {
  return (
    <motion.div
      className={`
        cyber-card relative
        ${glow ? 'animate-border-glow' : ''}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { 
        scale: 1.02,
        boxShadow: '0 10px 40px rgba(0, 255, 198, 0.2)'
      } : {}}
      {...props}
    >
      {/* Animated border gradient */}
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-cyan via-cyber-blue to-cyber-pink opacity-75 blur-sm -z-10 animate-pulse" />
      )}
      
      {children}
    </motion.div>
  )
}

export default CyberCard
