import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  FiSearch, FiPlusCircle, FiThumbsUp, FiMapPin,
  FiBriefcase, FiCalendar, FiStar, FiX
} from 'react-icons/fi';
import './Experiences.css';

const Experiences = () => {
  const { isAuthenticated } = useAuth();
  const [experiences, setExperiences] = useState([]);
  const [filteredExperiences, setFilteredExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Filter states
  const [companyFilter, setCompanyFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    companies: [],
    cities: [],
    roles: [],
    years: []
  });

  // Form states
  const [formData, setFormData] = useState({
    company: '',
    city: '',
    country: '',
    role: '',
    year: new Date().getFullYear(),
    applicationStatus: 'Applied',
    experienceText: '',
    interviewProcess: '',
    rating: 3,
    tips: '',
    difficulty: 'Medium'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExperiences();
    fetchFilterStats();
  }, []);

  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyFilter, locationFilter, roleFilter, yearFilter, experiences]);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/experiences');
      setExperiences(data.experiences || []);
    } catch (error) {
      toast.error('Error fetching experiences');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterStats = async () => {
    try {
      const { data } = await axios.get('/experiences/stats');
      setFilterOptions(data.stats || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = experiences;

    if (companyFilter) {
      filtered = filtered.filter(exp =>
        exp.company.toLowerCase().includes(companyFilter.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(exp =>
        exp.location.city.toLowerCase().includes(locationFilter.toLowerCase()) ||
        exp.location.country.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (roleFilter) {
      filtered = filtered.filter(exp =>
        exp.role.toLowerCase().includes(roleFilter.toLowerCase())
      );
    }

    if (yearFilter) {
      filtered = filtered.filter(exp => exp.year === parseInt(yearFilter));
    }

    setFilteredExperiences(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to share your experience');
      return;
    }

    if (formData.experienceText.length < 50) {
      toast.error('Experience must be at least 50 characters');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/experiences', {
        company: formData.company,
        location: {
          city: formData.city,
          country: formData.country
        },
        role: formData.role,
        year: parseInt(formData.year),
        applicationStatus: formData.applicationStatus,
        experienceText: formData.experienceText,
        interviewProcess: formData.interviewProcess,
        rating: parseInt(formData.rating),
        tips: formData.tips,
        difficulty: formData.difficulty
      });

      toast.success('Experience shared successfully!');
      setShowForm(false);
      setFormData({
        company: '',
        city: '',
        country: '',
        role: '',
        year: new Date().getFullYear(),
        applicationStatus: 'Applied',
        experienceText: '',
        interviewProcess: '',
        rating: 3,
        tips: '',
        difficulty: 'Medium'
      });
      fetchExperiences();
      fetchFilterStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sharing experience');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (experienceId) => {
    if (!isAuthenticated) {
      toast.error('Please login to mark as helpful');
      return;
    }

    try {
      const { data } = await axios.put(`/experiences/${experienceId}/helpful`);

      // Update local state
      setExperiences(prev =>
        prev.map(exp =>
          exp._id === experienceId
            ? { ...exp, helpfulCount: data.helpfulCount }
            : exp
        )
      );

      toast.success(data.helpful ? 'Marked as helpful' : 'Unmarked as helpful');
    } catch (error) {
      toast.error('Error updating helpful status');
      console.error(error);
    }
  };

  const clearFilters = () => {
    setCompanyFilter('');
    setLocationFilter('');
    setRoleFilter('');
    setYearFilter('');
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FiStar
        key={index}
        className={index < rating ? 'star filled' : 'star'}
      />
    ));
  };

  return (
    <div className="experiences-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Interview Experiences</h1>
            <p>{filteredExperiences.length} experiences shared</p>
          </div>
          <button
            className="btn btn-primary share-btn"
            onClick={() => setShowForm(!showForm)}
          >
            <FiPlusCircle /> Share Experience
          </button>
        </div>

        {/* Search and Filter Bar */}
        <motion.div
          className="filter-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="filter-row">
            <div className="filter-item">
              <FiSearch className="filter-icon" />
              <input
                type="text"
                placeholder="Search by company"
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-item">
              <FiMapPin className="filter-icon" />
              <input
                type="text"
                placeholder="Location (city or country)"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-item">
              <FiBriefcase className="filter-icon" />
              <input
                type="text"
                placeholder="Role/Position"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-item">
              <FiCalendar className="filter-icon" />
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Years</option>
                {filterOptions.years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {(companyFilter || locationFilter || roleFilter || yearFilter) && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                <FiX /> Clear
              </button>
            )}
          </div>

          <div className="results-count">
            {filteredExperiences.length} experience{filteredExperiences.length !== 1 ? 's' : ''} found
          </div>
        </motion.div>

        {/* Share Experience Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              className="experience-form-container"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form className="experience-form" onSubmit={handleSubmit}>
                <h2>Share Your Experience</h2>
                <p className="form-subtitle">All experiences are shared anonymously</p>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Company Name *</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Google"
                    />
                  </div>

                  <div className="form-group">
                    <label>Role/Position *</label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Software Engineer"
                    />
                  </div>

                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., New York"
                    />
                  </div>

                  <div className="form-group">
                    <label>Country *</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., USA"
                    />
                  </div>

                  <div className="form-group">
                    <label>Year *</label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      required
                      min="2000"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div className="form-group">
                    <label>Application Status *</label>
                    <select
                      name="applicationStatus"
                      value={formData.applicationStatus}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                      <option value="No Response">No Response</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Difficulty</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                      <option value="Very Hard">Very Hard</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Overall Rating *</label>
                    <div className="rating-input">
                      {[1, 2, 3, 4, 5].map(star => (
                        <FiStar
                          key={star}
                          className={star <= formData.rating ? 'star filled clickable' : 'star clickable'}
                          onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Your Experience * (min 50 characters)</label>
                  <textarea
                    name="experienceText"
                    value={formData.experienceText}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    placeholder="Share your experience with the application and interview process..."
                    maxLength="2000"
                  />
                  <div className="char-count">
                    {formData.experienceText.length} / 2000
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Interview Process (optional)</label>
                  <textarea
                    name="interviewProcess"
                    value={formData.interviewProcess}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Describe the interview rounds, types of questions, etc..."
                    maxLength="1000"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Tips for Future Applicants (optional)</label>
                  <textarea
                    name="tips"
                    value={formData.tips}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Any advice for others applying to this company?"
                    maxLength="500"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Share Experience'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Experiences List */}
        <div className="experiences-list">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : filteredExperiences.length === 0 ? (
            <div className="no-experiences">
              <FiBriefcase />
              <p>No experiences found. Be the first to share!</p>
            </div>
          ) : (
            filteredExperiences.map((exp) => (
              <motion.div
                key={exp._id}
                className="experience-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="exp-header">
                  <div className="exp-title-section">
                    <h3>{exp.company}</h3>
                    <div className="exp-meta">
                      <span className="exp-role">
                        <FiBriefcase /> {exp.role}
                      </span>
                      <span className="exp-location">
                        <FiMapPin /> {exp.location.city}, {exp.location.country}
                      </span>
                      <span className="exp-year">
                        <FiCalendar /> {exp.year}
                      </span>
                    </div>
                  </div>

                  <div className="exp-rating-section">
                    <div className="rating-stars">
                      {renderStars(exp.rating)}
                    </div>
                    <span className={`status-badge ${exp.applicationStatus.toLowerCase().replace(' ', '-')}`}>
                      {exp.applicationStatus}
                    </span>
                  </div>
                </div>

                <div className="exp-body">
                  <div className="exp-section">
                    <h4>Experience</h4>
                    <p>{exp.experienceText}</p>
                  </div>

                  {exp.interviewProcess && (
                    <div className="exp-section">
                      <h4>Interview Process</h4>
                      <p>{exp.interviewProcess}</p>
                    </div>
                  )}

                  {exp.tips && (
                    <div className="exp-section tips">
                      <h4>💡 Tips</h4>
                      <p>{exp.tips}</p>
                    </div>
                  )}
                </div>

                <div className="exp-footer">
                  <div className="exp-info">
                    <span className="difficulty-badge difficulty-{exp.difficulty.toLowerCase().replace(' ', '-')}">
                      Difficulty: {exp.difficulty}
                    </span>
                    <span className="posted-date">
                      Posted {new Date(exp.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    className="helpful-btn"
                    onClick={() => handleMarkHelpful(exp._id)}
                    disabled={!isAuthenticated}
                  >
                    <FiThumbsUp />
                    Helpful ({exp.helpfulCount})
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Experiences;
