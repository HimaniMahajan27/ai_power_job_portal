import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiClock, FiCheckCircle, FiXCircle, FiBriefcase } from 'react-icons/fi';

const Dashboard = () => {
  useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await axios.get('applications');
      setApplications(data.applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'applied': return <FiClock />;
      case 'under_review': return <FiClock />;
      case 'waitlist': return <FiBriefcase />;
      case 'accepted': return <FiCheckCircle />;
      case 'rejected': return <FiXCircle />;
      case 'withdrawn': return <FiXCircle />;
      default: return <FiBriefcase />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied': return '#F59E0B';
      case 'under_review': return '#3B82F6';
      case 'waitlist': return '#8B5CF6';
      case 'accepted': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'withdrawn': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'applied': 'Applied',
      'under_review': 'Under Review',
      'waitlist': 'Waitlist',
      'accepted': 'Accepted',
      'rejected': 'Rejected',
      'withdrawn': 'Withdrawn'
    };
    return labels[status] || status;
  };

  const filteredApplications = filter === 'all'
    ? applications
    : applications.filter(app => app.status === filter);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-page container" style={{ padding: '80px 24px' }}>
      <h1>My Applications</h1>
      <p style={{ color: 'var(--gray-600)', marginBottom: '32px' }}>
        Track your job applications
      </p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'applied', label: 'Applied' },
          { key: 'under_review', label: 'Under Review' },
          { key: 'waitlist', label: 'Waitlist' },
          { key: 'accepted', label: 'Accepted' },
          { key: 'rejected', label: 'Rejected' }
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`btn ${filter === key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredApplications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3>No applications found</h3>
          <p>Start applying to jobs to see them here</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredApplications.map((app, index) => (
            <motion.div
              key={app._id}
              className="card"
              style={{ padding: '24px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
                <div>
                  <h3>{app.job?.title}</h3>
                  <p style={{ color: 'var(--gray-600)', marginTop: '4px' }}>
                    {app.job?.company}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '8px' }}>
                    Applied on {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: `${getStatusColor(app.status)}20`,
                  color: getStatusColor(app.status),
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>
                  {getStatusIcon(app.status)}
                  {getStatusLabel(app.status)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
