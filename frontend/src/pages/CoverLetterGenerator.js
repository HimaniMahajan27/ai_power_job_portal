import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiUpload,
  FiCheckCircle,
  FiFileText,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './CoverLetterGenerator.css';

const CoverLetterGenerator = () => {
  const { user } = useAuth();
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState(null);
  const [fileError, setFileError] = useState('');
  const [companyError, setCompanyError] = useState('');
  const [jobError, setJobError] = useState('');
  const [lastGeneratedTime, setLastGeneratedTime] = useState(null);
  const [usage, setUsage] = useState(null);

  const fetchUsage = async () => {
    try {
      const { data } = await axios.get('cover-letter/usage');
      if (data.success) setUsage(data);
    } catch {}
  };

  useEffect(() => { fetchUsage(); }, []);

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

  const handleCompanyNameChange = (e) => {
    setCompanyName(e.target.value);
    if (e.target.value.trim()) {
      setCompanyError('');
    }
  };

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
    if (e.target.value.trim()) {
      setJobError('');
    }
  };

  const checkCooldown = () => {
    if (lastGeneratedTime) {
      const timeSince = Date.now() - lastGeneratedTime;
      const cooldownMs = 5000; // 5 seconds cooldown

      if (timeSince < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - timeSince) / 1000);
        toast.error(`Please wait ${remainingSeconds} seconds before generating again`);
        return false;
      }
    }
    return true;
  };

  const handleGenerate = async () => {
    let hasErrors = false;

    // Validate resume file
    if (!resumeFile) {
      setFileError('❌ Resume PDF is required');
      hasErrors = true;
    }

    // Validate company name
    if (!companyName.trim()) {
      setCompanyError('❌ Company name is required');
      hasErrors = true;
    } else if (companyName.trim().length < 2) {
      setCompanyError('❌ Company name must be at least 2 characters');
      hasErrors = true;
    } else if (companyName.trim().length > 100) {
      setCompanyError('❌ Company name must be less than 100 characters');
      hasErrors = true;
    }

    // Validate job description
    if (!jobDescription.trim()) {
      setJobError('❌ Job description is required');
      hasErrors = true;
    } else if (jobDescription.trim().length < 50) {
      setJobError('❌ Please provide a more detailed job description (minimum 50 characters)');
      hasErrors = true;
    } else if (jobDescription.trim().length > 10000) {
      setJobError('❌ Job description is too long (maximum 10,000 characters)');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    // Check cooldown
    if (!checkCooldown()) {
      return;
    }

    setGenerating(true);
    setFileError('');
    setCompanyError('');
    setJobError('');

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('companyName', companyName.trim());
      formData.append('jobDescription', jobDescription.trim());

      const { data } = await axios.post('cover-letter/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setCoverLetter(data);
      setLastGeneratedTime(Date.now());
      fetchUsage();
      toast.success('Cover letter generated successfully!');

      // Smooth scroll to results
      setTimeout(() => {
        document.querySelector('.cover-letter-results')?.scrollIntoView({
          behavior: 'smooth'
        });
      }, 100);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Generation failed';
      setFileError(`❌ ${errorMsg}`);
      toast.error('Failed to generate cover letter');
    } finally {
      setGenerating(false);
    }
  };

  const downloadCoverLetterPDF = async () => {
    if (!coverLetter || !user) return;

    try {
      // Dynamic import of pdfmake
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

      // Handle different export formats across pdfmake versions
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      const pdfFonts = pdfFontsModule.default || pdfFontsModule;

      // Set fonts - handle both 0.2.x and 0.3.x structures
      if (pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
      } else if (pdfFonts.vfs) {
        pdfMake.vfs = pdfFonts.vfs;
      } else {
        pdfMake.vfs = pdfFonts;
      }

      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Split cover letter into paragraphs
      const paragraphs = coverLetter.coverLetter.split('\n\n').filter(p => p.trim());

      const docDefinition = {
        pageSize: 'LETTER',
        pageMargins: [72, 72, 72, 72], // 1-inch margins

        content: [
          // User contact information (top left)
          {
            stack: [
              { text: coverLetter.userInfo.name || user.name || '[Your Name]', style: 'userName' },
              { text: coverLetter.userInfo.email || user.email || '', style: 'userContact' },
              { text: coverLetter.userInfo.phone || user.phone || '', style: 'userContact' }
            ],
            margin: [0, 0, 0, 20]
          },

          // Date (right-aligned)
          {
            text: currentDate,
            alignment: 'right',
            margin: [0, 0, 0, 20],
            fontSize: 11
          },

          // Recipient address (left-aligned)
          {
            stack: [
              { text: 'Hiring Manager', bold: true },
              { text: companyName, bold: true }
            ],
            margin: [0, 0, 0, 20]
          },

          // Spacing
          { text: '\n' },

          // Cover letter body paragraphs
          ...paragraphs.map(paragraph => ({
            text: paragraph.trim(),
            alignment: 'justify',
            lineHeight: 1.5,
            margin: [0, 0, 0, 15]
          })),

          // Spacing before closing
          { text: '\n' },

          // Closing
          {
            stack: [
              { text: 'Sincerely,' },
              { text: '\n\n' },
              { text: coverLetter.userInfo.name || user.name || '[Your Name]', bold: true }
            ]
          }
        ],

        styles: {
          userName: {
            fontSize: 12,
            bold: true,
            margin: [0, 0, 0, 2]
          },
          userContact: {
            fontSize: 10,
            margin: [0, 0, 0, 2]
          }
        },

        defaultStyle: {
          fontSize: 11,
          font: 'Roboto',
          color: '#333333'
        }
      };

      // Generate filename
      const sanitizedCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Cover_Letter_${sanitizedCompanyName}.pdf`;

      const creator = pdfMake.createPdf || (pdfMake.default && pdfMake.default.createPdf);
      if (!creator) {
        throw new Error('pdfMake.createPdf is not available');
      }
      creator.call(pdfMake.default || pdfMake, docDefinition).download(filename);
      toast.success('Cover letter PDF downloaded!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const handleGenerateAnother = () => {
    setResumeFile(null);
    setResumeFileName('');
    setCompanyName('');
    setJobDescription('');
    setCoverLetter(null);
    setFileError('');
    setCompanyError('');
    setJobError('');
  };

  return (
    <div className="cover-letter-generator">
      <div className="clg-container">
        {/* Header */}
        <motion.div
          className="clg-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="header-icon">
            <FiFileText />
          </div>
          <h1>AI Cover Letter Generator</h1>
          <p className="header-subtitle">
            Generate professional, tailored cover letters in seconds using AI
          </p>
          {usage && (
            <div className="usage-counter" style={{
              marginTop: '12px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: usage.remaining === 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
              color: usage.remaining === 0 ? '#EF4444' : '#10B981',
              fontSize: '14px',
              fontWeight: '600',
              display: 'inline-block'
            }}>
              {usage.remaining} / {usage.limit} generations remaining today
            </div>
          )}
        </motion.div>

        {!coverLetter ? (
          <motion.div
            className="clg-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* File Upload Section */}
            <div className="form-section">
              <h2>Upload Your Resume</h2>
              <div className="upload-section">
                <label htmlFor="resume-upload" className="upload-box">
                  <input
                    type="file"
                    id="resume-upload"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-content">
                    {resumeFile ? (
                      <>
                        <FiCheckCircle className="upload-icon success" />
                        <p className="upload-filename">{resumeFileName}</p>
                        <p className="upload-hint">Click to change file</p>
                      </>
                    ) : (
                      <>
                        <FiUpload className="upload-icon" />
                        <p className="upload-text">Click to upload resume PDF</p>
                        <p className="upload-hint">Maximum file size: 5MB</p>
                      </>
                    )}
                  </div>
                </label>
                {fileError && <p className="error-message">{fileError}</p>}
              </div>
            </div>

            {/* Company Name Section */}
            <div className="form-section">
              <h2>Company Name</h2>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Google, Microsoft, Apple"
                value={companyName}
                onChange={handleCompanyNameChange}
                maxLength={100}
              />
              {companyError && <p className="error-message">{companyError}</p>}
            </div>

            {/* Job Description Section */}
            <div className="form-section">
              <h2>Job Description</h2>
              <textarea
                className="textarea-field"
                placeholder="Paste the full job description here. Include responsibilities, requirements, and qualifications for the best results..."
                value={jobDescription}
                onChange={handleJobDescriptionChange}
                rows={12}
                maxLength={10000}
              />
              <div className="character-count">
                {jobDescription.length} / 10,000 characters
              </div>
              {jobError && <p className="error-message">{jobError}</p>}
            </div>

            {/* Generate Button */}
            <motion.button
              className="generate-button"
              onClick={handleGenerate}
              disabled={generating}
              whileHover={{ scale: generating ? 1 : 1.02 }}
              whileTap={{ scale: generating ? 1 : 0.98 }}
            >
              {generating ? (
                <>
                  <div className="spinner"></div>
                  Generating Cover Letter...
                </>
              ) : (
                <>
                  <FiFileText />
                  Generate Cover Letter
                </>
              )}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="cover-letter-results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Results Header */}
            <div className="results-header">
              <h2>Your Cover Letter is Ready!</h2>
              <div className="letter-metadata">
                <div className="metadata-item">
                  <FiFileText />
                  <span>{coverLetter.wordCount} words</span>
                </div>
                <div className="metadata-item">
                  <FiCheckCircle />
                  <span>Professional format</span>
                </div>
              </div>
            </div>

            {/* Cover Letter Preview */}
            <div className="cover-letter-preview">
              <div className="preview-header">
                <div className="user-info">
                  <p className="user-name">{coverLetter.userInfo.name || user?.name || '[Your Name]'}</p>
                  <p className="user-contact">{coverLetter.userInfo.email || user?.email}</p>
                  {coverLetter.userInfo.phone && (
                    <p className="user-contact">{coverLetter.userInfo.phone}</p>
                  )}
                </div>
                <div className="letter-date">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              <div className="preview-recipient">
                <p className="recipient-title">Hiring Manager</p>
                <p className="recipient-company">{companyName}</p>
              </div>

              <div className="letter-body">
                {coverLetter.coverLetter.split('\n\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="letter-paragraph">
                      {paragraph.trim()}
                    </p>
                  )
                ))}
              </div>

              <div className="letter-closing">
                <p>Sincerely,</p>
                <p className="signature">{coverLetter.userInfo.name || user?.name || '[Your Name]'}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <motion.button
                className="download-button"
                onClick={downloadCoverLetterPDF}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiDownload />
                Download as PDF
              </motion.button>
              <motion.button
                className="secondary-button"
                onClick={handleGenerateAnother}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiRefreshCw />
                Generate Another
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Generating Overlay */}
        {generating && (
          <motion.div
            className="generating-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="generating-content">
              <div className="spinner-lg"></div>
              <h3>Generating Your Cover Letter</h3>
              <p>
                Our AI is crafting a professional cover letter tailored to your resume and the job description...
              </p>
              <p className="eta">This usually takes 5-10 seconds</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
