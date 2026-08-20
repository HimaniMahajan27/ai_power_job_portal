import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBriefcase,
  FiUser,
  FiMessageSquare,
  FiMenu,
  FiX,
  FiSearch,
  FiLogIn,
  FiLogOut,
  FiSun,
  FiMoon,
  FiFileText,
  FiStar,
  FiCheckCircle,
  FiList
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const isLoggedIn = !!user;

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <>
      <motion.nav 
        className="navbar"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="container navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <motion.div 
              className="logo-icon"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <FiBriefcase />
            </motion.div>
            <span className="logo-text">
              <span className="logo-purple">Job</span>Portal
            </span>
          </Link>

          {/* Right Side - Only Menu Button & Profile/Logout */}
          <div className="navbar-right">
            {/* Theme Toggle Button */}
            <button 
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>

            {/* Hamburger Menu Button */}
            <button 
              className="menu-toggle-btn"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Profile & Logout (Only when logged in) */}
            {isLoggedIn && (
              <div className="navbar-actions">
                <Link to="/profile" className="nav-link">
                  <FiUser className="nav-icon" />
                </Link>
                <button 
                  onClick={handleLogout}
                  className="nav-link logout-btn"
                  title="Logout"
                >
                  <FiLogOut className="nav-icon" />
                </button>
              </div>
            )}

            {/* Login & Register (Only when not logged in) */}
            {!isLoggedIn && (
              <div className="navbar-actions">
                <Link to="/login" className="nav-link">
                  <FiLogIn className="nav-icon" />
                </Link>
                <Link to="/register">
                  <button className="btn btn-primary btn-sm">
                    Get Started
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Vertical Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              className="vertical-sidebar"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              <div className="sidebar-content">
                <Link to="/jobs" className="sidebar-link" onClick={() => setIsOpen(false)}>
                  <FiSearch className="sidebar-icon" />
                  Find Jobs
                </Link>

                <Link to="/experiences" className="sidebar-link" onClick={() => setIsOpen(false)}>
                  <FiStar className="sidebar-icon" />
                  Experiences
                </Link>

                {isLoggedIn ? (
                  <>
                    {user?.role === 'employer' ? (
                      <>
                        <Link to="/dashboard" className="sidebar-link" onClick={() => setIsOpen(false)}>
                          <FiStar className="sidebar-icon" />
                          Dashboard
                        </Link>
                        <Link to="/post-job" className="sidebar-link" onClick={() => setIsOpen(false)}>
                          <FiBriefcase className="sidebar-icon" />
                          Post Job
                        </Link>
                        <Link to="/my-jobs" className="sidebar-link" onClick={() => setIsOpen(false)}>
                          <FiList className="sidebar-icon" />
                          My Jobs
                        </Link>
                        <Link to="/applications" className="sidebar-link" onClick={() => setIsOpen(false)}>
                          <FiCheckCircle className="sidebar-icon" />
                          Applications
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/dashboard" className="sidebar-link" onClick={() => setIsOpen(false)}>
                          <FiCheckCircle className="sidebar-icon" />
                          Track Applications
                        </Link>
                        <Link to="/cover-letter-generator" className="sidebar-link" onClick={() => setIsOpen(false)}>
                          <FiFileText className="sidebar-icon" />
                          Cover Letter Generator
                        </Link>
                        <Link to="/practice-test" className="sidebar-link" onClick={() => setIsOpen(false)}>
                          <FiStar className="sidebar-icon" />
                          Practice Test
                        </Link>
                      </>
                    )}
                    <Link to="/resume-analyzer" className="sidebar-link" onClick={() => setIsOpen(false)}>
                      <FiUser className="sidebar-icon" />
                      AI Resume
                    </Link>
                    <Link to="/messages" className="sidebar-link" onClick={() => setIsOpen(false)}>
                      <FiMessageSquare className="sidebar-icon" />
                      Messages
                    </Link>
                  </>
                ) : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
