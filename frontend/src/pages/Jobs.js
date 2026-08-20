import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  FiSearch,
  FiMapPin,
  FiBriefcase,
  FiDollarSign,
  FiClock,
  FiFilter,
  FiX,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import './Jobs.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    category: '',
    employmentType: '',
    experienceLevel: '',
    remote: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    count: 0
  });

  const categories = [
    'Technology', 'Marketing', 'Sales', 'Design', 'Finance',
    'Healthcare', 'Education', 'Engineering', 'Customer Service', 'Other'
  ];

  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'];

  useEffect(() => {
    fetchJobs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: 12
      };

      const { data } = await axios.get('jobs', { params });

      setJobs(data.jobs);
      setPagination({
        page: data.currentPage,
        totalPages: data.totalPages,
        count: data.count
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      category: '',
      employmentType: '',
      experienceLevel: '',
      remote: false
    });
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

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'full-time': return '#10B981';
      case 'part-time': return '#3B82F6';
      case 'contract': return '#F59E0B';
      case 'internship': return '#7C3AED';
      case 'freelance': return '#EC4899';
      default: return '#7C3AED';
    }
  };

  const activeFilterCount = [
    filters.category,
    filters.employmentType,
    filters.experienceLevel,
    filters.remote
  ].filter(Boolean).length;

  return (
    <div className="fj-page">
      <div className="fj-container">
        {/* Header */}
        <motion.div
          className="fj-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="fj-title">Find Your <span className="fj-gradient-text">Dream Job</span></h1>
          <p className="fj-subtitle">{pagination.count} jobs available</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="fj-search-bar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="fj-search-group">
            <FiSearch className="fj-search-icon" />
            <input
              type="text"
              placeholder="Job title, keywords..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <div className="fj-search-divider"></div>
          <div className="fj-search-group">
            <FiMapPin className="fj-search-icon" />
            <input
              type="text"
              placeholder="City, state, or remote"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
          </div>
          <button className="fj-search-btn" onClick={() => fetchJobs()}>
            <FiSearch />
            Search
          </button>
          <button
            className={`fj-filter-toggle ${activeFilterCount > 0 ? 'has-filters' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            Filters
            {activeFilterCount > 0 && (
              <span className="fj-filter-badge">{activeFilterCount}</span>
            )}
          </button>
        </motion.div>

        {/* Content Area */}
        <div className="fj-content">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <>
                <motion.div
                  className="fj-sidebar-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFilters(false)}
                />
                <motion.aside
                  className="fj-sidebar"
                  initial={{ x: -320, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -320, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <div className="fj-sidebar-header">
                    <h3>Filters</h3>
                    <div className="fj-sidebar-actions">
                      <button className="fj-clear-btn" onClick={clearFilters}>
                        Clear All
                      </button>
                      <button className="fj-close-btn" onClick={() => setShowFilters(false)}>
                        <FiX />
                      </button>
                    </div>
                  </div>

                  <div className="fj-filter-group">
                    <label>Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="fj-filter-group">
                    <label>Employment Type</label>
                    <div className="fj-type-pills">
                      {employmentTypes.map(type => (
                        <button
                          key={type}
                          className={`fj-type-pill ${filters.employmentType === type ? 'active' : ''}`}
                          onClick={() => handleFilterChange('employmentType', filters.employmentType === type ? '' : type)}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="fj-filter-group">
                    <label>Experience Level</label>
                    <div className="fj-type-pills">
                      {experienceLevels.map(level => (
                        <button
                          key={level}
                          className={`fj-type-pill ${filters.experienceLevel === level ? 'active' : ''}`}
                          onClick={() => handleFilterChange('experienceLevel', filters.experienceLevel === level ? '' : level)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="fj-filter-group">
                    <label className="fj-checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.remote}
                        onChange={(e) => handleFilterChange('remote', e.target.checked)}
                      />
                      <span>Remote Only</span>
                    </label>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Jobs List */}
          <div className="fj-jobs-area">
            {loading ? (
              <div className="fj-skeleton-grid">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="fj-skeleton-card">
                    <div className="fj-skeleton-accent"></div>
                    <div className="fj-skeleton-body">
                      <div className="fj-skeleton-line fj-sk-title"></div>
                      <div className="fj-skeleton-line fj-sk-subtitle"></div>
                      <div className="fj-skeleton-line fj-sk-meta"></div>
                      <div className="fj-skeleton-line fj-sk-desc"></div>
                      <div className="fj-skeleton-line fj-sk-desc short"></div>
                      <div className="fj-skeleton-footer">
                        <div className="fj-skeleton-line fj-sk-salary"></div>
                        <div className="fj-skeleton-btn"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <motion.div
                className="fj-empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="fj-empty-icon">
                  <FiSearch />
                </div>
                <h3>No jobs found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button className="fj-clear-filters-btn" onClick={clearFilters}>
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              <div className="fj-grid">
                <AnimatePresence>
                  {jobs.map((job, index) => {
                    const typeColor = getTypeColor(job.employmentType);

                    return (
                      <motion.div
                        key={job._id}
                        className="fj-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        layout
                      >
                        <div className="fj-card-accent" style={{ background: typeColor }}></div>
                        <div className="fj-card-body">
                          {/* Header */}
                          <div className="fj-card-header">
                            <div className="fj-card-title-group">
                              <h3 className="fj-card-title">
                                <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                              </h3>
                              <p className="fj-card-company">{job.company}</p>
                            </div>
                            <span
                              className="fj-type-badge"
                              style={{
                                background: `${typeColor}15`,
                                color: typeColor,
                                borderColor: `${typeColor}40`
                              }}
                            >
                              {job.employmentType || 'Full-time'}
                            </span>
                          </div>

                          {/* Meta Row */}
                          <div className="fj-card-meta">
                            <span className="fj-meta-item">
                              <FiMapPin />
                              {job.location?.remote ? 'Remote' : job.location?.city || 'Not specified'}
                            </span>
                            <span className="fj-meta-item">
                              <FiBriefcase />
                              {job.employmentType || 'Full-time'}
                            </span>
                            <span className="fj-meta-item">
                              <FiClock />
                              {job.experienceLevel || 'Not specified'}
                            </span>
                          </div>

                          {/* Skills Pills */}
                          {job.skills && job.skills.length > 0 && (
                            <div className="fj-card-skills">
                              {job.skills.slice(0, 4).map((skill, i) => (
                                <span key={i} className="fj-skill-pill">{skill}</span>
                              ))}
                              {job.skills.length > 4 && (
                                <span className="fj-skill-more">+{job.skills.length - 4}</span>
                              )}
                            </div>
                          )}

                          {/* Description */}
                          <p className="fj-card-desc">
                            {job.description?.substring(0, 120)}...
                          </p>

                          {/* Footer */}
                          <div className="fj-card-footer">
                            <span className="fj-card-salary">
                              <FiDollarSign />
                              {formatSalary(job)}
                            </span>
                            <Link to={`/jobs/${job._id}`} className="fj-view-btn">
                              View Details
                              <FiArrowRight />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
              <motion.div
                className="fj-pagination"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  className="fj-page-btn"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                >
                  <FiChevronLeft />
                  Previous
                </button>
                <div className="fj-page-numbers">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        className={`fj-page-num ${pagination.page === pageNum ? 'active' : ''}`}
                        onClick={() => setPagination({ ...pagination, page: pageNum })}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  className="fj-page-btn"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                >
                  Next
                  <FiChevronRight />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
