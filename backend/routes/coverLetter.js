const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PdfReader } = require('pdfreader');
const { protect } = require('../middleware/auth');
const { checkAiLimit, getAiUsage } = require('../middleware/aiLimiter');
const { generateCoverLetter } = require('../utils/aiAnalyzer'); // Unified AI with fallback

// Configure multer for PDF uploads (same as resume.js)
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

// @route   GET /api/cover-letter/usage
// @desc    Get daily cover letter usage count
// @access  Private
router.get('/usage', protect, getAiUsage('coverLetter'));

// @route   POST /api/cover-letter/generate
// @desc    Generate cover letter from resume and job description
// @access  Private
router.post('/generate', protect, checkAiLimit('coverLetter'), upload.single('resume'), async (req, res) => {
  try {
    const { companyName, jobDescription } = req.body;

    // Validate required fields
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resume PDF is required'
      });
    }

    if (!companyName || companyName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    if (!jobDescription || jobDescription.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Job description is required'
      });
    }

    // Validate company name length
    const trimmedCompanyName = companyName.trim();
    if (trimmedCompanyName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Company name must be at least 2 characters'
      });
    }

    if (trimmedCompanyName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Company name must be less than 100 characters'
      });
    }

    // Validate job description length
    const trimmedJobDescription = jobDescription.trim();
    if (trimmedJobDescription.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a more detailed job description (minimum 50 characters)'
      });
    }

    // Extract text from PDF using pdfreader
    let resumeText;
    try {
      if (!req.file.buffer || req.file.buffer.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'PDF file appears to be empty'
        });
      }

      // Parse PDF using pdfreader (same as resume analyzer)
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

      // Validate minimum text extraction (at least 50 chars for meaningful resume)
      if (resumeText.trim().length < 50) {
        return res.status(400).json({
          success: false,
          message: 'Resume PDF does not contain enough readable text. Please upload a valid resume.'
        });
      }

      console.log(`Successfully extracted ${resumeText.length} characters from resume PDF`);
    } catch (pdfError) {
      console.error('PDF parsing error:', {
        message: pdfError.message,
        fileSize: req.file.buffer ? req.file.buffer.length : 0,
        mimeType: req.file.mimetype
      });
      return res.status(400).json({
        success: false,
        message: `Failed to parse PDF: ${pdfError.message}`
      });
    }

    // Get user info from authenticated request (via protect middleware)
    const userDetails = {
      name: req.user.name || '',
      email: req.user.email || '',
      phone: req.user.phone || '',
      candidateName: req.user.name || 'Your Name'
    };

    // Build complete job description with company name
    const fullJobDescription = `Company: ${trimmedCompanyName}\n\n${trimmedJobDescription}`;

    // Call AI API to generate cover letter (tries Groq → Gemini → Template)
    const result = await generateCoverLetter(
      resumeText,
      fullJobDescription,
      userDetails
    );

    if (!result.success) {
      // Handle AI API errors
      const statusCode = result.error.includes('quota') || result.error.includes('rate limit')
        ? 429
        : 500;

      return res.status(statusCode).json({
        success: false,
        message: result.error
      });
    }

    // Calculate word and char count
    const coverLetterText = result.coverLetter;
    const wordCount = coverLetterText.split(/\s+/).filter(word => word.length > 0).length;
    const charCount = coverLetterText.length;

    // Return successful response with cover letter and user info
    res.status(200).json({
      success: true,
      coverLetter: coverLetterText,
      wordCount: wordCount,
      charCount: charCount,
      provider: result.provider || 'AI',
      userInfo: userDetails
    });

  } catch (error) {
    console.error('Cover letter generation error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while generating the cover letter. Please try again.'
    });
  }
});

module.exports = router;
