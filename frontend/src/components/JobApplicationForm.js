import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './JobApplicationForm.css';

const JobApplicationForm = ({ jobId, jobTitle, applicationFields = [], onSuccess }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    coverLetter: '',
    resume: null,
    answers: {}
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAnswerChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      answers: { ...prev.answers, [fieldName]: value }
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFormData({ ...formData, resume: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.coverLetter.trim()) {
      toast.error('Please write a cover letter');
      return;
    }

    if (!formData.resume) {
      toast.error('Please upload your resume');
      return;
    }

    const missingRequired = applicationFields.find(
      f => f.required && !formData.answers[f.fieldName]?.toString().trim()
    );
    if (missingRequired) {
      toast.error(`Please fill in "${missingRequired.fieldName}"`);
      return;
    }

    // #region agent log
    if (typeof fetch !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/0e7bbb6d-51ac-4f13-911d-de5f9a6bdf29', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `log_${Date.now()}_APPLICATION_SUBMIT_START`,
          runId: 'pre-fix-1',
          hypothesisId: 'H2',
          location: 'frontend/src/components/JobApplicationForm.js:35',
          message: 'Job application submit start',
          data: {
            jobId,
            hasResume: !!formData.resume,
            coverLetterLength: formData.coverLetter.length
          },
          timestamp: Date.now()
        })
      }).catch(() => {});
    }
    // #endregion

    setLoading(true);
    try {
      const submitFormData = new FormData();
      submitFormData.append('job', jobId);
      submitFormData.append('coverLetter', formData.coverLetter);
      submitFormData.append('resume', formData.resume);

      if (applicationFields.length > 0) {
        const answers = applicationFields
          .filter(f => formData.answers[f.fieldName]?.toString().trim())
          .map(f => ({ question: f.fieldName, answer: formData.answers[f.fieldName] }));
        submitFormData.append('answers', JSON.stringify(answers));
      }

      const { data } = await axios.post('applications', submitFormData);

      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/0e7bbb6d-51ac-4f13-911d-de5f9a6bdf29', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `log_${Date.now()}_APPLICATION_SUBMIT_SUCCESS`,
            runId: 'pre-fix-1',
            hypothesisId: 'H2',
            location: 'frontend/src/components/JobApplicationForm.js:55',
            message: 'Job application submit success',
            data: {
              jobId,
              applicationId: data?.application?._id,
              status: data?.application?.status
            },
            timestamp: Date.now()
          })
        }).catch(() => {});
      }
      // #endregion

      toast.success('Application submitted successfully!');
      // Reset form
      setFormData({
        coverLetter: '',
        resume: null,
        answers: {}
      });
      // Reset file input
      const fileInput = document.getElementById('resume-upload');
      if (fileInput) fileInput.value = '';
      setIsOpen(false);
      onSuccess && onSuccess();
    } catch (error) {
      console.error('Application submission error:', error.response || error);
      const errorMessage = error.response?.data?.message || error.message || 'Error submitting application';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="btn btn-primary apply-btn"
        onClick={() => setIsOpen(true)}
      >
        Apply Now
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="application-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="application-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Apply for {jobTitle}</h2>
                <button
                  className="close-btn"
                  onClick={() => setIsOpen(false)}
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="application-form">
                <div className="form-group">
                  <label>Cover Letter *</label>
                  <textarea
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    placeholder="Tell us why you're a great fit for this position..."
                    rows="6"
                    required
                  />
                  <span className="char-count">
                    {formData.coverLetter.length} / 5000 characters
                  </span>
                </div>

                <div className="form-group">
                  <label>Resume / CV *</label>
                  <div className="file-upload">
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      required
                    />
                    <label htmlFor="resume-upload" className="file-label">
                      {formData.resume ? (
                        <span className="file-selected">✓ Resume uploaded</span>
                      ) : (
                        <span>
                          <span className="upload-icon">📄</span>
                          Click to upload or drag and drop
                        </span>
                      )}
                    </label>
                  </div>
                  <p className="file-info">PDF, DOC, or DOCX (Max 10MB)</p>
                </div>

                {applicationFields.length > 0 && (
                  <div className="custom-fields-section">
                    <h4>Additional Information</h4>
                    {applicationFields.map((field) => (
                      <div className="form-group" key={field.fieldName}>
                        <label>
                          {field.fieldName} {field.required && '*'}
                        </label>
                        {field.fieldType === 'textarea' ? (
                          <textarea
                            value={formData.answers[field.fieldName] || ''}
                            onChange={(e) => handleAnswerChange(field.fieldName, e.target.value)}
                            placeholder={`Enter ${field.fieldName.toLowerCase()}`}
                            rows="4"
                            required={field.required}
                          />
                        ) : (
                          <input
                            type={field.fieldType || 'text'}
                            value={formData.answers[field.fieldName] || ''}
                            onChange={(e) => handleAnswerChange(field.fieldName, e.target.value)}
                            placeholder={`Enter ${field.fieldName.toLowerCase()}`}
                            required={field.required}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {user && (
                  <div className="user-info">
                    <h4>Applicant Information</h4>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default JobApplicationForm;
