import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './PostJob.css';

const PostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState(['']);
  const [responsibilities, setResponsibilities] = useState(['']);
  const [skills, setSkills] = useState(['']);
  const [applicationFields, setApplicationFields] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    company: user?.company || '',
    description: '',
    employmentType: 'Full-time',
    experienceLevel: 'Mid Level',
    category: 'Technology',
    location: {
      city: '',
      state: '',
      country: '',
      remote: false,
      hybrid: false
    },
    salary: {
      min: '',
      max: '',
      currency: 'USD',
      period: 'yearly'
    },
    applicationDeadline: '',
    questions: []
  });

  const categories = [
    'Technology', 'Marketing', 'Sales', 'Design', 'Finance',
    'Healthcare', 'Education', 'Engineering', 'Customer Service', 'Other'
  ];

  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('location.')) {
      const locKey = name.split('.')[1];
      setFormData({
        ...formData,
        location: { ...formData.location, [locKey]: value }
      });
    } else if (name.includes('salary.')) {
      const salKey = name.split('.')[1];
      setFormData({
        ...formData,
        salary: { ...formData.salary, [salKey]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleLocationCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      location: { ...formData.location, [name]: checked }
    });
  };

  const addItem = (type) => {
    if (type === 'requirement') setRequirements([...requirements, '']);
    else if (type === 'responsibility') setResponsibilities([...responsibilities, '']);
    else if (type === 'skill') setSkills([...skills, '']);
  };

  const updateItem = (type, index, value) => {
    if (type === 'requirement') {
      const updated = [...requirements];
      updated[index] = value;
      setRequirements(updated);
    } else if (type === 'responsibility') {
      const updated = [...responsibilities];
      updated[index] = value;
      setResponsibilities(updated);
    } else if (type === 'skill') {
      const updated = [...skills];
      updated[index] = value;
      setSkills(updated);
    }
  };

  const removeItem = (type, index) => {
    if (type === 'requirement') {
      setRequirements(requirements.filter((_, i) => i !== index));
    } else if (type === 'responsibility') {
      setResponsibilities(responsibilities.filter((_, i) => i !== index));
    } else if (type === 'skill') {
      setSkills(skills.filter((_, i) => i !== index));
    }
  };

  // Application Fields handlers
  const addApplicationField = () => {
    setApplicationFields([...applicationFields, { fieldName: '', fieldType: 'text', required: false }]);
  };

  const updateApplicationField = (index, key, value) => {
    const updated = [...applicationFields];
    updated[index] = { ...updated[index], [key]: value };
    setApplicationFields(updated);
  };

  const removeApplicationField = (index) => {
    setApplicationFields(applicationFields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const jobData = {
        ...formData,
        requirements: requirements.filter(r => r.trim()),
        responsibilities: responsibilities.filter(r => r.trim()),
        skills: skills.filter(s => s.trim()),
        applicationFields: applicationFields.filter(f => f.fieldName.trim()),
        employer: user._id
      };

      const { data } = await axios.post('jobs', jobData);
      toast.success('Job posted successfully!');
      navigate(`/jobs/${data.job._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error posting job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job-page">
      <div className="container">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft /> Back
        </button>

        <motion.div
          className="post-job-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="post-job-header">
            <h1>Post a New Job</h1>
            <p>Fill in the details to create a job listing</p>
          </div>

          <form onSubmit={handleSubmit} className="post-job-form">
            {/* Basic Details Section */}
            <section className="form-section">
              <h2>Job Details</h2>

              <div className="form-group">
                <label>Job Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Senior React Developer"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Company *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Company name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Job Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the job role, main responsibilities, and expectations"
                  rows="6"
                  required
                />
              </div>
            </section>

            {/* Details Lists */}
            <section className="form-section">
              <h2>Requirements</h2>
              <div className="list-items">
                {requirements.map((req, index) => (
                  <div key={index} className="list-item">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => updateItem('requirement', index, e.target.value)}
                      placeholder="e.g., 5+ years of experience"
                    />
                    {requirements.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeItem('requirement', index)}
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn-add"
                onClick={() => addItem('requirement')}
              >
                <FiPlus /> Add Requirement
              </button>
            </section>

            <section className="form-section">
              <h2>Responsibilities</h2>
              <div className="list-items">
                {responsibilities.map((resp, index) => (
                  <div key={index} className="list-item">
                    <input
                      type="text"
                      value={resp}
                      onChange={(e) => updateItem('responsibility', index, e.target.value)}
                      placeholder="e.g., Build scalable backend services"
                    />
                    {responsibilities.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeItem('responsibility', index)}
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn-add"
                onClick={() => addItem('responsibility')}
              >
                <FiPlus /> Add Responsibility
              </button>
            </section>

            <section className="form-section">
              <h2>Required Skills</h2>
              <div className="list-items">
                {skills.map((skill, index) => (
                  <div key={index} className="list-item">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => updateItem('skill', index, e.target.value)}
                      placeholder="e.g., React, Node.js, MongoDB"
                    />
                    {skills.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeItem('skill', index)}
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn-add"
                onClick={() => addItem('skill')}
              >
                <FiPlus /> Add Skill
              </button>
            </section>

            {/* Employment Details */}
            <section className="form-section">
              <h2>Employment Details</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Employment Type</label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                  >
                    {employmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Experience Level</label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                  >
                    {experienceLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Location */}
            <section className="form-section">
              <h2>Location</h2>

              <div className="form-row three-col">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    placeholder="City"
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleInputChange}
                    placeholder="State"
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="location.country"
                    value={formData.location.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="remote"
                    checked={formData.location.remote}
                    onChange={handleLocationCheckbox}
                  />
                  Remote
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="hybrid"
                    checked={formData.location.hybrid}
                    onChange={handleLocationCheckbox}
                  />
                  Hybrid
                </label>
              </div>
            </section>

            {/* Salary */}
            <section className="form-section">
              <h2>Salary Information</h2>

              <div className="form-row four-col">
                <div className="form-group">
                  <label>Minimum Salary</label>
                  <input
                    type="number"
                    name="salary.min"
                    value={formData.salary.min}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>Maximum Salary</label>
                  <input
                    type="number"
                    name="salary.max"
                    value={formData.salary.max}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>Currency</label>
                  <select
                    name="salary.currency"
                    value={formData.salary.currency}
                    onChange={handleInputChange}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Period</label>
                  <select
                    name="salary.period"
                    value={formData.salary.period}
                    onChange={handleInputChange}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Timeline */}
            <section className="form-section">
              <h2>Timeline</h2>

              <div className="form-group">
                <label>Application Deadline</label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleInputChange}
                />
              </div>
            </section>

            {/* Application Form Builder */}
            <section className="form-section">
              <h2>Application Form</h2>

              <div className="app-fields-info">
                <p><strong>Resume</strong> and <strong>Cover Letter</strong> uploads are always included by default.</p>
                <p>Add extra fields below that applicants must fill when applying.</p>
              </div>

              <div className="list-items">
                {applicationFields.map((field, index) => (
                  <div key={index} className="app-field-item">
                    <div className="app-field-name">
                      <label>Field Name</label>
                      <input
                        type="text"
                        value={field.fieldName}
                        onChange={(e) => updateApplicationField(index, 'fieldName', e.target.value)}
                        placeholder="e.g., Portfolio URL, Years of Experience"
                      />
                    </div>
                    <div className="app-field-type">
                      <label>Type</label>
                      <select
                        value={field.fieldType}
                        onChange={(e) => updateApplicationField(index, 'fieldType', e.target.value)}
                      >
                        <option value="text">Text</option>
                        <option value="textarea">Long Text</option>
                        <option value="url">URL</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                      </select>
                    </div>
                    <label className="app-field-required">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateApplicationField(index, 'required', e.target.checked)}
                      />
                      Required
                    </label>
                    <button
                      type="button"
                      className="app-field-remove"
                      onClick={() => removeApplicationField(index)}
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn-add"
                onClick={addApplicationField}
              >
                <FiPlus /> Add Custom Field
              </button>
            </section>

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? 'Posting...' : 'Post Job'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default PostJob;
