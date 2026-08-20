import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  FiBriefcase, FiUsers, FiCheckCircle, FiMessageSquare,
  FiTrendingUp, FiEye, FiArrowRight
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import './EmployerDashboard.css';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, appsRes, msgsRes] = await Promise.all([
          axios.get('/jobs/my-jobs'),
          axios.get('/applications'),
          axios.get('/messages')
        ]);
        setJobs(jobsRes.data.jobs || []);
        setApplications(appsRes.data.applications || []);
        setMessages(msgsRes.data.messages || msgsRes.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const totalApplicants = applications.length;
    const offersAccepted = applications.filter(a => a.status === 'accepted').length;
    const unreadMessages = Array.isArray(messages)
      ? messages.filter(m => !m.read && m.receiver === user?._id).length
      : 0;
    const totalViews = jobs.reduce((sum, j) => sum + (j.views || 0), 0);
    return { totalJobs, activeJobs, totalApplicants, offersAccepted, unreadMessages, totalViews };
  }, [jobs, applications, messages, user]);

  const applicantsPerJob = useMemo(() => {
    return jobs
      .map(j => ({
        name: j.title.length > 20 ? j.title.substring(0, 20) + '...' : j.title,
        fullName: j.title,
        applicants: j.applicationsCount || 0,
        views: j.views || 0
      }))
      .sort((a, b) => b.applicants - a.applicants)
      .slice(0, 8);
  }, [jobs]);

  const statusBreakdown = useMemo(() => {
    const counts = { applied: 0, under_review: 0, waitlist: 0, accepted: 0, rejected: 0, withdrawn: 0 };
    applications.forEach(a => {
      if (counts[a.status] !== undefined) counts[a.status]++;
    });
    return [
      { name: 'Applied', value: counts.applied, color: '#F59E0B' },
      { name: 'Under Review', value: counts.under_review, color: '#3B82F6' },
      { name: 'Waitlist', value: counts.waitlist, color: '#8B5CF6' },
      { name: 'Accepted', value: counts.accepted, color: '#10B981' },
      { name: 'Rejected', value: counts.rejected, color: '#EF4444' },
      { name: 'Withdrawn', value: counts.withdrawn, color: '#6B7280' }
    ].filter(s => s.value > 0);
  }, [applications]);

  const jobsOverTime = useMemo(() => {
    const monthMap = {};
    jobs.forEach(j => {
      const date = new Date(j.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!monthMap[key]) monthMap[key] = { key, name: label, jobs: 0, applicants: 0 };
      monthMap[key].jobs++;
      monthMap[key].applicants += (j.applicationsCount || 0);
    });
    return Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key));
  }, [jobs]);

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
      .slice(0, 5);
  }, [applications]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="ed-chart-tooltip">
          <p className="ed-tooltip-label">{payload[0]?.payload?.fullName || label}</p>
          {payload.map((entry, i) => (
            <p key={i} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Jobs Posted', value: stats.totalJobs, icon: <FiBriefcase />, color: '#7C3AED', bg: '#F5F3FF' },
    { label: 'Total Applicants', value: stats.totalApplicants, icon: <FiUsers />, color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Offers Accepted', value: stats.offersAccepted, icon: <FiCheckCircle />, color: '#10B981', bg: '#ECFDF5' },
    { label: 'Unread Messages', value: stats.unreadMessages, icon: <FiMessageSquare />, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Active Listings', value: stats.activeJobs, icon: <FiTrendingUp />, color: '#EC4899', bg: '#FDF2F8' },
    { label: 'Total Views', value: stats.totalViews, icon: <FiEye />, color: '#6366F1', bg: '#EEF2FF' }
  ];

  return (
    <div className="ed-page">
      <div className="ed-container">
        <motion.div
          className="ed-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="ed-title">Dashboard</h1>
            <p className="ed-subtitle">
              Welcome back, {user?.name || 'Employer'}. Here's your hiring overview.
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="ed-stats-grid">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="ed-stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="ed-stat-icon" style={{ background: stat.bg, color: stat.color }}>
                {stat.icon}
              </div>
              <div className="ed-stat-info">
                <span className="ed-stat-value">{stat.value}</span>
                <span className="ed-stat-label">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="ed-charts-row">
          {/* Applicants per Job - Bar Chart */}
          <motion.div
            className="ed-chart-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="ed-chart-title">Applicants per Job</h3>
            {applicantsPerJob.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={applicantsPerJob} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: 'var(--gray-500)' }}
                    axisLine={{ stroke: 'var(--gray-200)' }}
                    tickLine={false}
                    angle={-25}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'var(--gray-500)' }}
                    axisLine={{ stroke: 'var(--gray-200)' }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="applicants" name="Applicants" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="ed-empty-chart">
                <FiUsers size={32} />
                <p>No applicant data yet</p>
              </div>
            )}
          </motion.div>

          {/* Application Status Breakdown - Pie Chart */}
          <motion.div
            className="ed-chart-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="ed-chart-title">Application Status</h3>
            {statusBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusBreakdown.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => (
                      <span style={{ color: 'var(--gray-600)', fontSize: '13px' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="ed-empty-chart">
                <FiCheckCircle size={32} />
                <p>No applications yet</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Jobs Posted Over Time - Area Chart */}
        <motion.div
          className="ed-chart-card ed-full-width"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="ed-chart-title">Posting & Application Trends</h3>
          {jobsOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={jobsOverTime} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: 'var(--gray-500)' }}
                  axisLine={{ stroke: 'var(--gray-200)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'var(--gray-500)' }}
                  axisLine={{ stroke: 'var(--gray-200)' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => (
                    <span style={{ color: 'var(--gray-600)', fontSize: '13px' }}>{value}</span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="jobs"
                  name="Jobs Posted"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  fill="url(#colorJobs)"
                />
                <Area
                  type="monotone"
                  dataKey="applicants"
                  name="Applicants"
                  stroke="#EC4899"
                  strokeWidth={2}
                  fill="url(#colorApps)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="ed-empty-chart">
              <FiTrendingUp size={32} />
              <p>Post your first job to see trends</p>
            </div>
          )}
        </motion.div>

        {/* Recent Applications */}
        <motion.div
          className="ed-chart-card ed-full-width"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="ed-section-header">
            <h3 className="ed-chart-title">Recent Applications</h3>
            <button className="btn btn-ghost" onClick={() => navigate('/applications')}>
              View All <FiArrowRight />
            </button>
          </div>
          {recentApplications.length > 0 ? (
            <div className="ed-recent-list">
              {recentApplications.map((app) => (
                <div key={app._id} className="ed-recent-item">
                  <div className="ed-recent-info">
                    <span className="ed-recent-name">{app.applicant?.name || 'Unknown'}</span>
                    <span className="ed-recent-job">applied for {app.job?.title || 'a position'}</span>
                  </div>
                  <div className="ed-recent-meta">
                    <span
                      className="ed-status-badge"
                      style={{
                        background: getStatusColor(app.status) + '20',
                        color: getStatusColor(app.status)
                      }}
                    >
                      {app.status?.replace('_', ' ')}
                    </span>
                    <span className="ed-recent-date">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ed-empty-chart">
              <FiUsers size={32} />
              <p>No applications received yet</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    applied: '#F59E0B',
    under_review: '#3B82F6',
    waitlist: '#8B5CF6',
    accepted: '#10B981',
    rejected: '#EF4444',
    withdrawn: '#6B7280'
  };
  return colors[status] || '#6B7280';
};

export default EmployerDashboard;
