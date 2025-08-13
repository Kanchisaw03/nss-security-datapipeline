import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  AiOutlineHome, 
  AiOutlineCloudUpload, 
  AiOutlineUser,
  AiOutlineLogout,
  AiOutlineMenu,
  AiOutlineClose
} from 'react-icons/ai'
import { BiShieldQuarter } from 'react-icons/bi'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: AiOutlineHome },
    { name: 'Data Ingestion', href: '/data-ingestion', icon: AiOutlineCloudUpload },
    { name: 'Consent Management', href: '/consent-management', icon: BiShieldQuarter },
  ]

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-cyber-navy/90 backdrop-blur-md border-b border-cyber-cyan/30"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyber-cyan to-cyber-blue rounded-lg flex items-center justify-center">
                <BiShieldQuarter className="text-cyber-dark text-xl" />
              </div>
              <span className="text-xl font-orbitron font-bold glow-text">CyberShield</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300
                    ${isActive 
                      ? 'text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30' 
                      : 'text-cyber-gray hover:text-cyber-cyan hover:bg-cyber-cyan/5'
                    }
                  `}
                >
                  <Icon className="text-lg" />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-cyan"
                      layoutId="activeNav"
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <motion.button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-cyber-cyan/10 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-cyber-pink to-cyber-purple rounded-full flex items-center justify-center">
                  <AiOutlineUser className="text-white" />
                </div>
                <span className="text-cyber-gray font-medium">{user?.name}</span>
              </motion.button>

              {/* User Dropdown */}
              {showUserMenu && (
                <motion.div
                  className="absolute right-0 mt-2 w-48 bg-cyber-navy border border-cyber-cyan/30 rounded-lg shadow-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="p-4 border-b border-cyber-cyan/20">
                    <p className="text-sm text-cyber-gray">{user?.email}</p>
                    <p className="text-xs text-cyber-gray/70">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-3 text-cyber-gray hover:text-cyber-pink hover:bg-cyber-pink/10 transition-colors duration-300"
                  >
                    <AiOutlineLogout />
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg text-cyber-gray hover:text-cyber-cyan transition-colors duration-300"
              whileTap={{ scale: 0.95 }}
            >
              {showMobileMenu ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <motion.div
            className="md:hidden border-t border-cyber-cyan/30"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300
                      ${isActive 
                        ? 'text-cyber-cyan bg-cyber-cyan/10 border-l-4 border-cyber-cyan' 
                        : 'text-cyber-gray hover:text-cyber-cyan hover:bg-cyber-cyan/5'
                      }
                    `}
                  >
                    <Icon className="text-lg" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
              
              <div className="border-t border-cyber-cyan/20 pt-4">
                <div className="flex items-center space-x-3 px-4 py-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyber-pink to-cyber-purple rounded-full flex items-center justify-center">
                    <AiOutlineUser className="text-white" />
                  </div>
                  <div>
                    <p className="text-cyber-gray font-medium">{user?.name}</p>
                    <p className="text-xs text-cyber-gray/70">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-cyber-gray hover:text-cyber-pink hover:bg-cyber-pink/10 transition-colors duration-300"
                >
                  <AiOutlineLogout />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

export default Navbar
