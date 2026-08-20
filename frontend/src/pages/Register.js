import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiArrowRight, FiEye, FiEyeOff, FiBriefcase } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'jobseeker'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return alert('Passwords do not match!');
    }
    
    setIsLoading(true);
    
    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.role
    );
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  const handleGoogleSignup = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Start your job search journey today</p>
          </div>

          {/* Google Signup */}
          <button 
            type="button"
            className="google-btn"
            onClick={handleGoogleSignup}
          >
            <FcGoogle size={24} />
            Sign up with Google
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Role Selection */}
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${formData.role === 'jobseeker' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'jobseeker' })}
              >
                <FiUser />
                Job Seeker
              </button>
              <button
                type="button"
                className={`role-btn ${formData.role === 'employer' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'employer' })}
              >
                <FiBriefcase />
                Employer
              </button>
            </div>

            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <label className="checkbox-label">
              <input type="checkbox" required />
              <span>
                I agree to the{' '}
                <Link to="/terms" className="link">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="link">Privacy Policy</Link>
              </span>
            </label>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
              <FiArrowRight />
            </button>
          </form>

          {/* Login Link */}
          <div className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="link">
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
