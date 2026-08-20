import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiUpload,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiTarget,
  FiAward
} from 'react-icons/fi';
import './ResumeAnalyzer.css';

const ResumeAnalyzer = () => {
  const { jobId } = useParams();
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobError, setJobError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (jobId) {
      axios.get(`jobs/${jobId}`)
        .then(({ data }) => {
          if (data.job?.description) {
            setJobDescription(data.job.description);
          }
        })
        .catch(() => {});
    }
  }, [jobId]);

  const handleFileUpload = (e) => {
    setFileError('');
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setFileError('❌ Only PDF files are accepted');
        setResumeFile(null);
        setResumeFileName('');
        return;
      }
      
      const sizeInMB = file.size / (1024 * 1024);
      if (sizeInMB > 5) {
        setFileError(`❌ File is ${sizeInMB.toFixed(2)}MB. Maximum size is 5MB`);
        setResumeFile(null);
        setResumeFileName('');
        return;
      }

      setResumeFile(file);
      setResumeFileName(file.name);
      setFileError('');
    }
  };

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
    if (e.target.value.trim()) {
      setJobError('');
    }
  };

  const handleAnalyze = async () => {
    let hasErrors = false;

    if (!resumeFile) {
      setFileError('❌ Resume PDF is required');
      hasErrors = true;
    }

    if (!jobDescription.trim()) {
      setJobError('❌ Job description is required');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    setAnalyzing(true);
    setFileError('');
    setJobError('');
    
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobDescription', jobDescription);
      if (jobId) {
        formData.append('jobId', jobId);
      }

      const { data } = await axios.post('resume/analyze-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setAnalysis(data.analysis);
      toast.success('Resume analyzed successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Analysis failed';
      setFileError(`❌ ${errorMsg}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const CircularProgress = ({ score, size = 150, label }) => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="circular-progress" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--gray-200)"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getScoreColor(score)}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="progress-content">
          <div className="score">{score}%</div>
          <div className="label">{label}</div>
        </div>
      </div>
    );
  };

  const BarChart = ({ data, label }) => {
    return (
      <div className="bar-chart">
        <div className="bar-label">{label}</div>
        <div className="bar-container">
          <motion.div
            className="bar-fill"
            style={{ 
              width: `${data}%`,
              background: `linear-gradient(90deg, ${getScoreColor(data)}, ${getScoreColor(data)}dd)`
            }}
            initial={{ width: 0 }}
            animate={{ width: `${data}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <span className="bar-value">{data}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="resume-analyzer-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="page-title">
            <FiTarget /> AI Resume Analyzer
          </h1>
          <p className="page-subtitle">
            Powered by Google Gemini AI - Get instant feedback on your resume
          </p>

          {!analysis ? (
            <div className="upload-section card">
              <div className="upload-icon">
                <FiUpload />
              </div>
              <h2>AI Resume Analyzer</h2>
              <p>Upload your resume PDF and paste the job description to get AI-powered feedback</p>

              <div className="input-group">
                <label className="input-label">
                  <FiUpload /> Upload Resume (PDF)
                </label>
                <div className={`file-upload-area ${resumeFile ? 'uploaded' : ''}`}>
                  <input
                    id="resume-file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="file-input"
                  />
                  <label htmlFor="resume-file" className="file-label">
                    <div className="file-content">
                      {resumeFile ? (
                        <>
                          <FiCheckCircle style={{ fontSize: '40px', color: '#10B981' }} />
                          <div>
                            <p className="file-text">✅ Uploaded</p>
                            <p className="file-subtext">{resumeFileName}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <FiUpload className="file-icon" />
                          <div>
                            <p className="file-text">Click to upload or drag and drop</p>
                            <p className="file-subtext">PDF file (Max 5MB)</p>
                          </div>
                        </>
                      )}
                    </div>
                  </label>
                </div>
                {fileError && (
                  <div className="error-message">
                    {fileError}
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">Paste Job Description</label>
                <textarea
                  className="job-description-input"
                  placeholder="Paste the job description here...

Example:
Senior Software Engineer
Location: San Francisco, CA
Salary: $150k - $200k

We're looking for...
Required Skills:
- 5+ years of experience with React
- Strong JavaScript knowledge
- Experience with AWS..."
                  value={jobDescription}
                  onChange={handleJobDescriptionChange}
                  rows={12}
                />
                {jobError && (
                  <div className="error-message">
                    {jobError}
                  </div>
                )}
              </div>

              <button
                className="btn btn-primary btn-lg"
                onClick={handleAnalyze}
                disabled={analyzing || !resumeFile || !jobDescription.trim()}
              >
                {analyzing ? (
                  <>
                    <div className="spinner-sm"></div>
                    Analyzing with Gemini AI...
                  </>
                ) : (
                  <>
                    <FiAward />
                    Analyze Resume
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="analysis-results">
              {/* Overall Score */}
              <div className="score-section card">
                <h2>Overall Match Score</h2>
                <div className="score-grid">
                  <CircularProgress 
                    score={analysis.overallMatch} 
                    label={getScoreLabel(analysis.overallMatch)}
                  />
                  <div className="score-details">
                    <p className="summary">{analysis.summary}</p>
                    <div className="quick-stats">
                      <div className="stat">
                        <span className="stat-label">ATS Score</span>
                        <span className="stat-value" style={{ color: getScoreColor(analysis.atsScore) }}>
                          {analysis.atsScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="breakdown-section card">
                <h2>Detailed Breakdown</h2>
                <div className="breakdown-grid">
                  <BarChart data={analysis.skillsMatch.matchPercentage} label="Skills Match" />
                  <BarChart data={analysis.experienceMatch.score} label="Experience Match" />
                  <BarChart data={analysis.keywordAnalysis.matchPercentage} label="Keyword Match" />
                  <BarChart data={analysis.educationMatch.score} label="Education Match" />
                </div>
              </div>

              {/* Skills Analysis */}
              <div className="skills-section">
                <div className="card matched-skills">
                  <h3>
                    <FiCheckCircle style={{ color: 'var(--success)' }} />
                    Matched Skills ({analysis.skillsMatch.matched.length})
                  </h3>
                  <div className="skills-list">
                    {analysis.skillsMatch.matched.map((skill, i) => (
                      <span key={i} className="skill-tag matched">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="card missing-skills">
                  <h3>
                    <FiXCircle style={{ color: 'var(--error)' }} />
                    Missing Skills ({analysis.skillsMatch.missing.length})
                  </h3>
                  <div className="skills-list">
                    {analysis.skillsMatch.missing.map((skill, i) => (
                      <span key={i} className="skill-tag missing">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Keywords Analysis */}
              <div className="keywords-section card">
                <h3>Keyword Analysis</h3>
                <div className="keywords-grid">
                  <div>
                    <h4><FiCheckCircle /> Matched Keywords</h4>
                    <ul>
                      {analysis.keywordAnalysis.matched.map((kw, i) => (
                        <li key={i} className="matched">{kw}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4><FiXCircle /> Missing Keywords</h4>
                    <ul>
                      {analysis.keywordAnalysis.missing.map((kw, i) => (
                        <li key={i} className="missing">{kw}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              <div className="strengths-section card">
                <h3>
                  <FiTrendingUp style={{ color: 'var(--success)' }} />
                  Your Strengths
                </h3>
                <ul className="strengths-list">
                  {analysis.strengths.map((strength, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <FiCheckCircle />
                      {strength}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="improvements-section card">
                <h3>
                  <FiAlertCircle style={{ color: 'var(--warning)' }} />
                  Recommended Improvements
                </h3>
                <div className="improvements-list">
                  {analysis.improvements.map((improvement, i) => (
                    <motion.div
                      key={i}
                      className={`improvement-card priority-${improvement.priority}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="improvement-header">
                        <span className="area">{improvement.area}</span>
                        <span className={`priority priority-${improvement.priority}`}>
                          {improvement.priority} priority
                        </span>
                      </div>
                      <p>{improvement.suggestion}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Feedback Sections */}
              <div className="feedback-section">
                <div className="card">
                  <h3>Experience Feedback</h3>
                  <p>{analysis.experienceMatch.feedback}</p>
                </div>
                <div className="card">
                  <h3>Education Feedback</h3>
                  <p>{analysis.educationMatch.feedback}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setAnalysis(null);
                    setResumeFile(null);
                    setResumeFileName('');
                    setJobDescription('');
                    setFileError('');
                    setJobError('');
                  }}
                >
                  Analyze Another Resume
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => window.print()}
                >
                  Save as PDF
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
