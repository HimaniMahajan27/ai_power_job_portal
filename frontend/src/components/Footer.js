import React from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section">
            <div className="footer-logo">
              <div className="logo-icon">
                <FiBriefcase />
              </div>
              <span className="logo-text">
                <span className="logo-purple">Job</span>Portal
              </span>
            </div>
            <p className="footer-desc">
              Your gateway to amazing career opportunities. Connect with top employers and find your dream job.
            </p>
            <div className="social-links">
              <a href="https://www.linkedin.com/in/prabhleen-kaur-586833302" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                <FiLinkedin />
              </a>
              <a href="https://github.com/prabhleen003/AI-Powered-Job-Portal" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
                <FiGithub />
              </a>
              <a href="mailto:prabhleen6003@gmail.edu" className="social-link" aria-label="Email">
                <FiMail />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div className="footer-section">
            <h4 className="footer-title">For Job Seekers</h4>
            <ul className="footer-links">
              <li><Link to="/jobs">Browse Jobs</Link></li>
              <li><Link to="/dashboard">My Applications</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/messages">Messages</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">For Employers</h4>
            <ul className="footer-links">
              <li><Link to="/post-job">Post a Job</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/dashboard">Manage Jobs</Link></li>
              <li><Link to="/candidates">Browse Candidates</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Company</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/careers">Careers</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} JobPortal. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
