import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import JobApplicationForm from '../components/JobApplicationForm';
import {
  FiMapPin, FiBriefcase, FiClock,
  FiUsers, FiArrowRight, FiTarget
} from 'react-icons/fi';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchJob = async () => {
    try {
      const { data } = await axios.get(`jobs/${id}`);
      setJob(data.job);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Job not found');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!job) return null;

  // #region agent log
  if (typeof fetch !== 'undefined') {
    fetch('http://127.0.0.1:7242/ingest/0e7bbb6d-51ac-4f13-911d-de5f9a6bdf29', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `log_${Date.now()}_JOB_DETAILS_VISIBILITY`,
        runId: 'pre-fix-1',
        hypothesisId: 'H1',
        location: 'frontend/src/pages/JobDetails.js:75',
        message: 'JobDetails apply visibility check',
        data: {
          isAuthenticated,
          userRole: user?.role,
          jobId: job?._id
        },
        timestamp: Date.now()
      })
    }).catch(() => {});
  }
  // #endregion

  return (
    <div className="job-details-page container" style={{ padding: '80px 24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="job-header" style={{ marginBottom: '32px' }}>
          <h1>{job.title}</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--gray-600)', marginTop: '8px' }}>
            {job.company}
          </p>
          
          <div className="job-meta" style={{ display: 'flex', gap: '24px', marginTop: '24px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiMapPin /> {job.location?.remote ? 'Remote' : job.location?.city}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiBriefcase /> {job.employmentType}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiClock /> {job.experienceLevel}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUsers /> {job.applicationsCount} applicants
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            {isAuthenticated && user?.role === 'jobseeker' ? (
              <JobApplicationForm
                jobId={job._id}
                jobTitle={job.title}
                applicationFields={job.applicationFields || []}
                onSuccess={fetchJob}
              />
            ) : (
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    toast.error('Only job seekers can apply');
                  }
                }}
              >
                Apply Now <FiArrowRight />
              </button>
            )}
            
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate(`/resume-analyzer/${job._id}`)}
            >
              <FiTarget /> Analyze Resume with AI
            </button>
          </div>
        </div>

        <div className="job-content" style={{ maxWidth: '800px' }}>
          <section style={{ marginBottom: '32px' }}>
            <h2>Job Description</h2>
            <p style={{ marginTop: '16px', lineHeight: '1.8' }}>{job.description}</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2>Requirements</h2>
            <ul style={{ marginTop: '16px', paddingLeft: '24px' }}>
              {job.requirements?.map((req, i) => (
                <li key={i} style={{ marginBottom: '8px' }}>{req}</li>
              ))}
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2>Responsibilities</h2>
            <ul style={{ marginTop: '16px', paddingLeft: '24px' }}>
              {job.responsibilities?.map((resp, i) => (
                <li key={i} style={{ marginBottom: '8px' }}>{resp}</li>
              ))}
            </ul>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default JobDetails;
