const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PdfReader } = require('pdfreader');
const { protect } = require('../middleware/auth');
const { analyzeResume } = require('../utils/aiAnalyzer'); // Unified AI with fallback
const Job = require('../models/Job');

// Configure multer for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// @route   POST /api/resume/analyze
// @desc    Analyze resume against job description using Gemini AI
// @access  Private
router.post('/analyze', protect, async (req, res) => {
  try {
    const { resumeText, jobId } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: 'Resume text is required'
      });
    }

    let jobDescription = req.body.jobDescription;

    // If jobId is provided, fetch the job description
    if (jobId && !jobDescription) {
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Construct comprehensive job description
      jobDescription = `
Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location?.city || 'Remote'}
Employment Type: ${job.employmentType}
Experience Level: ${job.experienceLevel}

Description:
${job.description}

Requirements:
${job.requirements?.join('\n') || 'Not specified'}

Responsibilities:
${job.responsibilities?.join('\n') || 'Not specified'}

Skills:
${job.skills?.join(', ') || 'Not specified'}
      `;
    }

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Job description or job ID is required'
      });
    }

    // Call Gemini AI
    const result = await analyzeResume(resumeText, jobDescription);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to analyze resume',
        error: result.error
      });
    }

    res.json({
      success: true,
      analysis: result.analysis
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during resume analysis'
    });
  }
});

// @route   POST /api/resume/analyze-text
// @desc    Analyze resume text directly (without job reference)
// @access  Private
router.post('/analyze-text', protect, async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Both resume text and job description are required'
      });
    }

    const result = await analyzeResume(resumeText, jobDescription);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to analyze resume',
        error: result.error
      });
    }

    res.json({
      success: true,
      analysis: result.analysis
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during resume analysis'
    });
  }
});

// @route   POST /api/resume/analyze-pdf
// @desc    Analyze resume from PDF file
// @access  Private
router.post('/analyze-pdf', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resume PDF file is required'
      });
    }

    // Validate file type
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are allowed. Received: ' + req.file.mimetype
      });
    }

    const { jobDescription, jobId } = req.body;

    if (!jobDescription && !jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job description or job ID is required'
      });
    }

    // Extract text from PDF using pdf2json
    let resumeText;
    try {
      if (!req.file.buffer || req.file.buffer.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'PDF file appears to be empty'
        });
      }

      // Parse PDF using pdfreader
      resumeText = await new Promise((resolve, reject) => {
        const pdfReader = new PdfReader();
        const rows = {}; // Store text by row/page

        pdfReader.parseBuffer(req.file.buffer, (err, item) => {
          if (err) {
            reject(err);
          } else if (!item) {
            // End of file - combine all text
            const text = Object.keys(rows)
              .sort((a, b) => parseFloat(a) - parseFloat(b))
              .map(rowKey => rows[rowKey].join(' '))
              .join('\n');
            resolve(text.trim());
          } else if (item.text) {
            // Accumulate text items by row
            const rowKey = `${item.page || 0}_${item.y || 0}`;
            if (!rows[rowKey]) {
              rows[rowKey] = [];
            }
            rows[rowKey].push(item.text);
          }
        });
      });

      if (!resumeText || resumeText.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Could not extract text from PDF. Please ensure the PDF contains readable text (not just images).'
        });
      }

      // Log extracted text length for debugging
      console.log(`Successfully extracted ${resumeText.length} characters from PDF`);
    } catch (pdfError) {
      console.error('PDF parsing error details:', {
        message: pdfError.message,
        stack: pdfError.stack,
        fileSize: req.file.buffer ? req.file.buffer.length : 0,
        mimeType: req.file.mimetype
      });
      return res.status(400).json({
        success: false,
        message: `Failed to parse PDF: ${pdfError.message}`
      });
    }

    // Build job description if jobId is provided
    let finalJobDescription = jobDescription;
    if (jobId && !jobDescription) {
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      finalJobDescription = `
Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location?.city || 'Remote'}
Employment Type: ${job.employmentType}
Experience Level: ${job.experienceLevel}

Description:
${job.description}

Requirements:
${job.requirements?.join('\n') || 'Not specified'}

Responsibilities:
${job.responsibilities?.join('\n') || 'Not specified'}

Skills:
${job.skills?.join(', ') || 'Not specified'}
      `;
    }

    // Analyze resume
    const result = await analyzeResume(resumeText, finalJobDescription);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to analyze resume with AI',
        error: result.error
      });
    }

    res.json({
      success: true,
      analysis: result.analysis
    });
  } catch (error) {
    console.error('Resume PDF analysis error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Server error during resume analysis: ' + error.message
    });
  }
});

module.exports = router;
