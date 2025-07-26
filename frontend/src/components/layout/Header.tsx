import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Search, 
  Bell, 
  User, 
  Menu,
  LogOut,
  Settings,
  PlusCircle,
  Home,
  MapPin,
  Users
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { authAPI } from '../../lib/auth';
import { notificationsAPI } from '../../lib/notifications';
import Button from '../ui/Button';
import PetraVerseLogo from './PetraVerseLogo';

const Header: React.FC = () => {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      clearAuth();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      clearAuth();
      navigate('/');
    }
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass sticky top-0 z-40 border-b border-white/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <PetraVerseLogo size={40} />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              PetraVerse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/search" 
              className="nav-link flex items-center space-x-2 group"
            >
              <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Search Pets</span>
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  to="/pets/create" 
                  className="nav-link flex items-center space-x-2 group"
                >
                  <PlusCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Post Pet</span>
                </Link>
                <Link 
                  to="/dashboard" 
                  className="nav-link flex items-center space-x-2 group"
                >
                  <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/notifications" 
                  className="nav-link flex items-center space-x-2 group relative"
                >
                  <Bell className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-error-500 to-error-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                  )}
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="nav-link flex items-center space-x-2 group text-accent-600"
                  >
                    <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* User Menu */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/20 transition-all duration-300"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center shadow-soft">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <motion.div
                        className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full opacity-30"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-neutral-800">{user?.name}</p>
                      <p className="text-xs text-neutral-500">{user?.email}</p>
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-64 glass rounded-2xl shadow-large border border-white/20 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-sm font-semibold text-neutral-800">{user?.name}</p>
                          <p className="text-xs text-neutral-500">{user?.email}</p>
                        </div>
                        <div className="py-2">
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-white/20 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            Profile Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-white/20 transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/login')}
                  className="hidden sm:flex"
                >
                  Login
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => navigate('/register')}
                  className="shadow-glow"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 hover:bg-white/20 rounded-xl transition-all duration-300"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/20 py-4 space-y-3"
            >
              <Link 
                to="/search" 
                className="flex items-center space-x-3 px-4 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-white/20 rounded-xl transition-all duration-300"
                onClick={() => setShowMobileMenu(false)}
              >
                <Search className="w-4 h-4" />
                <span>Search Pets</span>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/pets/create" 
                    className="flex items-center space-x-3 px-4 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-white/20 rounded-xl transition-all duration-300"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Post Pet</span>
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center space-x-3 px-4 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-white/20 rounded-xl transition-all duration-300"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Home className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/notifications" 
                    className="flex items-center space-x-3 px-4 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-white/20 rounded-xl transition-all duration-300 relative"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Bell className="w-4 h-4" />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="ml-auto w-5 h-5 bg-gradient-to-r from-error-500 to-error-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="flex items-center space-x-3 px-4 py-2 text-accent-600 hover:bg-white/20 rounded-xl transition-all duration-300"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Users className="w-4 h-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-white/20 rounded-xl transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-3 px-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    fullWidth
                    onClick={() => {
                      navigate('/login');
                      setShowMobileMenu(false);
                    }}
                  >
                    Login
                  </Button>
                  <Button 
                    size="sm" 
                    fullWidth
                    className="shadow-glow"
                    onClick={() => {
                      navigate('/register');
                      setShowMobileMenu(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;