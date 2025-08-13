import { motion } from 'framer-motion'
import Navbar from './Navbar'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-cyber-dark">
      <Navbar />
      <motion.main 
        className="pt-20 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </motion.main>
    </div>
  )
}

export default Layout
