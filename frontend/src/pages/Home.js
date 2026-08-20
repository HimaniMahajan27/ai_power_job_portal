import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  FiSearch, 
  FiBriefcase, 
  FiMessageSquare, 
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiClock,
  FiShield,
  FiArrowRight
} from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);
  const features = [
    {
      icon: <FiSearch />,
      title: 'Smart Search',
      description: 'Find your perfect job with our AI-powered search engine and advanced filters.'
    },
    {
      icon: <FiBriefcase />,
      title: 'Track Applications',
      description: 'Manage all your job applications in one place with real-time status updates.'
    },
    {
      icon: <FiMessageSquare />,
      title: 'Direct Messaging',
      description: 'Connect directly with employers and recruiters through our messaging system.'
    },
    {
      icon: <FiTrendingUp />,
      title: 'Career Growth',
      description: 'Get personalized recommendations and insights to advance your career.'
    },
    {
      icon: <FiShield />,
      title: 'Verified Employers',
      description: 'All companies are verified to ensure safe and legitimate job opportunities.'
    },
    {
      icon: <FiClock />,
      title: 'Quick Apply',
      description: 'Apply to multiple jobs in seconds with your saved profile and resume.'
    }
  ];

  const stats = [
    { icon: <FiBriefcase />, value: '10,000+', label: 'Active Jobs' },
    { icon: <FiUsers />, value: '50,000+', label: 'Job Seekers' },
    { icon: <FiAward />, value: '5,000+', label: 'Companies' }
  ];

  return (
    <div className="home-page gradient-bg">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="hero-badge"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <FiShield />
              <span>Trusted by 50,000+ job seekers</span>
            </motion.div>
            
            <h1 className="hero-title">
              Find Your <span className="gradient-text">Dream Job</span>
              <br />Today
            </h1>
            
            <p className="hero-subtitle">
              Discover thousands of job opportunities from top companies. 
              Your next career move starts here.
            </p>

            <div className="hero-search">
              <div className="search-input-group">
                <FiSearch className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Job title, keywords, or company"
                  className="search-input"
                />
              </div>
              <button className="btn btn-primary search-btn">
                Search Jobs
                <FiArrowRight />
              </button>
            </div>

            <div className="hero-tags">
              <span>Popular:</span>
              <Link to="/jobs?q=developer" className="tag">Developer</Link>
              <Link to="/jobs?q=designer" className="tag">Designer</Link>
              <Link to="/jobs?q=marketing" className="tag">Marketing</Link>
              <Link to="/jobs?q=remote" className="tag">Remote</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="stat-icon">{stat.icon}</div>
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>Why Choose JobPortal?</h2>
            <p>Everything you need to land your dream job</p>
          </motion.div>

          <div className="carousel-wrapper">
            <div className="carousel-track">
              {[...features, ...features].map((feature, index) => (
                <div key={index} className="feature-card card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div 
            className="cta-content"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2>Ready to Start Your Journey?</h2>
            <p>Join thousands of job seekers who found their dream careers</p>
            <div className="cta-buttons">
              <Link to="/register">
                <button className="btn btn-primary btn-lg">
                  Get Started Free
                  <FiArrowRight />
                </button>
              </Link>
              <Link to="/jobs">
                <button className="btn btn-secondary btn-lg">
                  Browse Jobs
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
