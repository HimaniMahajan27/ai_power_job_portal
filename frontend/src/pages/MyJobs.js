import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiBriefcase,
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiEdit,
  FiTrash2,
  FiEye,
  FiUsers,
  FiCalendar,
  FiSearch,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle
} from 'react-icons/fi';
import './MyJobs.css';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, jobId: null, jobTitle: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/jobs/my-jobs');
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load your jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    try {
      await axios.delete(`/jobs/${jobId}`);
      toast.success('Job deleted successfully');
      setJobs(jobs.filter(job => job._id !== jobId));
      setDeleteModal({ show: false, jobId: null, jobTitle: '' });
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error(error.response?.data?.message || 'Failed to delete job');
    }
  };

  const openDeleteModal = (jobId, jobTitle) => {
    setDeleteModal({ show: true, jobId, jobTitle });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, jobId: null, jobTitle: '' });
  };

  const formatSalary = (job) => {
    if (!job.salary || !job.salary.min) return 'Competitive';
    const { min, max, currency, period } = job.salary;
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0
    });
    if (max) {
      return `${formatter.format(min)} - ${formatter.format(max)}/${period}`;
    }
    return `${formatter.format(min)}/${period}`;
  };

  const getApplicationCount = (job) => job.applicationCount || 0;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#10B981';
      case 'draft': return '#F59E0B';
      case 'closed': return '#6B7280';
      default: return '#10B981';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return <FiCheckCircle />;
      case 'draft': return <FiAlertCircle />;
      case 'closed': return <FiXCircle />;
      default: return <FiCheckCircle />;
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffDays = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return posted.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Stats
  const stats = useMemo(() => ({
    total: jobs.length,
    active: jobs.filter(j => (j.status || 'active').toLowerCase() === 'active').length,
    closed: jobs.filter(j => (j.status || '').toLowerCase() === 'closed').length,
    totalApplicants: jobs.reduce((sum, j) => sum + getApplicationCount(j), 0)
  }), [jobs]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = !searchQuery ||
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' ||
        (job.status || 'active').toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, statusFilter]);

  const statusFilters = [
    { key: 'all', label: 'All Jobs', count: stats.total },
    { key: 'active', label: 'Active', count: stats.active },
    { key: 'draft', label: 'Draft', count: jobs.filter(j => (j.status || '').toLowerCase() === 'draft').length },
    { key: 'closed', label: 'Closed', count: stats.closed }
  ];

  return (
    <div className="my-jobs-page">
      <div className="mj-container">
        {/* Header */}
        <motion.div
          className="mj-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mj-header-left">
            <h1>My Jobs</h1>
            <p>Manage and track all your job postings</p>
          </div>
          <Link to="/post-job" className="mj-post-btn">
            <FiPlus />
            Post New Job
          </Link>
        </motion.div>

        {/* Stats Bar */}
        {!loading && jobs.length > 0 && (
          <motion.div
            className="mj-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="stat-card">
              <div className="stat-icon stat-icon-purple">
                <FiBriefcase />
              </div>
              <div className="stat-info">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total Jobs</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-green">
                <FiCheckCircle />
              </div>
              <div className="stat-info">
                <span className="stat-number">{stats.active}</span>
                <span className="stat-label">Active</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-gray">
                <FiXCircle />
              </div>
              <div className="stat-info">
                <span className="stat-number">{stats.closed}</span>
                <span className="stat-label">Closed</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <FiUsers />
              </div>
              <div className="stat-info">
                <span className="stat-number">{stats.totalApplicants}</span>
                <span className="stat-label">Applicants</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search & Filter Bar */}
        {!loading && jobs.length > 0 && (
          <motion.div
            className="mj-toolbar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="mj-search">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by title or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="mj-filters">
              {statusFilters.map(f => (
                <button
                  key={f.key}
                  className={`filter-btn ${statusFilter === f.key ? 'active' : ''}`}
                  onClick={() => setStatusFilter(f.key)}
                >
                  {f.label}
                  <span className="filter-count">{f.count}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Jobs List */}
        <div className="mj-content">
          {loading ? (
            <div className="mj-skeleton-grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-line skeleton-title"></div>
                  <div className="skeleton-line skeleton-subtitle"></div>
                  <div className="skeleton-line skeleton-meta"></div>
                  <div className="skeleton-line skeleton-meta short"></div>
                  <div className="skeleton-actions">
                    <div className="skeleton-btn"></div>
                    <div className="skeleton-btn"></div>
                    <div className="skeleton-btn"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <motion.div
              className="mj-empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="empty-icon">
                <FiBriefcase />
              </div>
              <h3>No jobs posted yet</h3>
              <p>Create your first job posting and start receiving applications from talented candidates.</p>
              <Link to="/post-job" className="mj-post-btn">
                <FiPlus />
                Post Your First Job
              </Link>
            </motion.div>
          ) : filteredJobs.length === 0 ? (
            <motion.div
              className="mj-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="empty-icon">
                <FiSearch />
              </div>
              <h3>No matching jobs</h3>
              <p>Try adjusting your search or filters.</p>
              <button className="mj-clear-btn" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <div className="mj-grid">
              <AnimatePresence>
                {filteredJobs.map((job, index) => {
                  const status = (job.status || 'active').toLowerCase();
                  const applicants = getApplicationCount(job);

                  return (
                    <motion.div
                      key={job._id}
                      className={`mj-card mj-card-${status}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                    >
                      {/* Status accent bar */}
                      <div className="mj-card-accent" style={{ background: getStatusColor(status) }}></div>

                      <div className="mj-card-body">
                        {/* Card Header */}
                        <div className="mj-card-header">
                          <div className="mj-card-title-group">
                            <h3 className="mj-card-title">{job.title}</h3>
                            <p className="mj-card-company">{job.company}</p>
                          </div>
                          <span
                            className="mj-status-badge"
                            style={{
                              background: `${getStatusColor(status)}15`,
                              color: getStatusColor(status),
                              borderColor: `${getStatusColor(status)}40`
                            }}
                          >
                            {getStatusIcon(status)}
                            {job.status || 'Active'}
                          </span>
                        </div>

                        {/* Meta Row */}
                        <div className="mj-card-meta">
                          <span className="mj-meta-item">
                            <FiMapPin />
                            {job.location?.remote ? 'Remote' : job.location?.city || 'Not specified'}
                            {job.location?.hybrid && ' (Hybrid)'}
                          </span>
                          <span className="mj-meta-item">
                            <FiBriefcase />
                            {job.employmentType || 'Full-time'}
                          </span>
                          <span className="mj-meta-item">
                            <FiClock />
                            {job.experienceLevel || 'Not specified'}
                          </span>
                        </div>

                        {/* Skills Pills */}
                        {job.skills && job.skills.length > 0 && (
                          <div className="mj-card-skills">
                            {job.skills.slice(0, 4).map((skill, i) => (
                              <span key={i} className="mj-skill-pill">{skill}</span>
                            ))}
                            {job.skills.length > 4 && (
                              <span className="mj-skill-more">+{job.skills.length - 4}</span>
                            )}
                          </div>
                        )}

                        {/* Salary */}
                        <div className="mj-card-salary">
                          <FiDollarSign />
                          <span>{formatSalary(job)}</span>
                        </div>

                        {/* Stats Row */}
                        <div className="mj-card-stats">
                          <div className="mj-stat">
                            <FiUsers />
                            <span><strong>{applicants}</strong> Applicant{applicants !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="mj-stat">
                            <FiEye />
                            <span>{job.views || 0} views</span>
                          </div>
                          <div className="mj-stat">
                            <FiCalendar />
                            <span>{formatDate(job.createdAt)}</span>
                          </div>
                        </div>

                        {/* Applicant bar */}
                        {applicants > 0 && (
                          <div className="mj-applicant-bar">
                            <div
                              className="mj-applicant-fill"
                              style={{
                                width: `${Math.min(100, (applicants / 50) * 100)}%`,
                                background: applicants > 20 ? '#10B981' : applicants > 5 ? '#F59E0B' : '#7C3AED'
                              }}
                            ></div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mj-card-actions">
                          <Link to={`/jobs/${job._id}`} className="mj-action-btn mj-action-view">
                            <FiEye />
                            <span>View</span>
                          </Link>
                          <Link to={`/edit-job/${job._id}`} className="mj-action-btn mj-action-edit">
                            <FiEdit />
                            <span>Edit</span>
                          </Link>
                          <button
                            className="mj-action-btn mj-action-delete"
                            onClick={() => openDeleteModal(job._id, job.title)}
                          >
                            <FiTrash2 />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteModal.show && (
            <>
              <motion.div
                className="mj-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeDeleteModal}
              />
              <motion.div
                className="mj-delete-modal"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
              >
                <div className="mj-modal-icon">
                  <FiTrash2 />
                </div>
                <h2>Delete Job Posting?</h2>
                <p className="mj-modal-job-title">"{deleteModal.jobTitle}"</p>
                <p className="mj-modal-warning">This action cannot be undone. All associated applications will also be removed.</p>
                <div className="mj-modal-actions">
                  <button className="mj-modal-cancel" onClick={closeDeleteModal}>
                    Cancel
                  </button>
                  <button
                    className="mj-modal-delete"
                    onClick={() => handleDelete(deleteModal.jobId)}
                  >
                    <FiTrash2 />
                    Delete Job
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyJobs;
