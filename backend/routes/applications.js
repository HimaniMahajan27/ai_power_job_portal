const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect, authorize } = require('../middleware/auth');

// Configure multer for resume uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// @route   POST /api/applications
// @desc    Apply to a job
// @access  Private (Job seekers only)
router.post(
  '/',
  protect,
  authorize('jobseeker'),
  upload.single('resume'),
  async (req, res) => {
    const { job, coverLetter, answers } = req.body;
    const resume = req.file;

    // #region agent log
    if (typeof fetch !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/0e7bbb6d-51ac-4f13-911d-de5f9a6bdf29', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `log_${Date.now()}_APPLICATION_POST_ENTRY`,
          runId: 'pre-fix-1',
          hypothesisId: 'H3',
          location: 'backend/routes/applications.js:31',
          message: 'POST /applications entry',
          data: {
            userId: req.user?._id,
            role: req.user?.role,
            jobId: job,
            hasResume: !!resume,
            coverLetterLength: coverLetter ? coverLetter.length : 0
          },
          timestamp: Date.now()
        })
      }).catch(() => {});
    }
    // #endregion

    // Validate required fields
    if (!job) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    if (!coverLetter || !coverLetter.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Cover letter is required'
      });
    }

    if (!resume) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required'
      });
    }

    try {
      // Check if job exists
      const jobDoc = await Job.findById(job);
      if (!jobDoc) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Check if already applied
      const existingApplication = await Application.findOne({
        job,
        applicant: req.user._id
      });

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied to this job'
        });
      }

      // Convert resume buffer to base64
      const resumeBase64 = resume.buffer.toString('base64');
      const resumeDataUrl = `data:${resume.mimetype};base64,${resumeBase64}`;

      // Create application
      const application = await Application.create({
        job,
        applicant: req.user._id,
        employer: jobDoc.employer,
        coverLetter,
        resume: resumeDataUrl,
        answers: answers || [],
        statusUpdates: [{
          status: 'applied',
          timestamp: new Date()
        }]
      });

      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/0e7bbb6d-51ac-4f13-911d-de5f9a6bdf29', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `log_${Date.now()}_APPLICATION_POST_SUCCESS`,
            runId: 'pre-fix-1',
            hypothesisId: 'H3',
            location: 'backend/routes/applications.js:85',
            message: 'POST /applications created application',
            data: {
              applicationId: application._id,
              jobId: application.job,
              applicantId: application.applicant
            },
            timestamp: Date.now()
          })
        }).catch(() => {});
      }
      // #endregion

      // Increment application count on job
      jobDoc.applicationsCount += 1;
      await jobDoc.save();

      // Populate application data
      await application.populate([
        { path: 'job', select: 'title company location' },
        { path: 'applicant', select: 'name email avatar' }
      ]);

      res.status(201).json({
        success: true,
        application
      });
    } catch (error) {
      console.error('Application error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }
);

// @route   GET /api/applications
// @desc    Get applications (for job seeker: their applications, for employer: applications to their jobs)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'jobseeker') {
      query.applicant = req.user._id;
    } else if (req.user.role === 'employer') {
      query.employer = req.user._id;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    const applications = await Application.find(query)
      .populate('job', 'title company location employmentType salary')
      .populate('applicant', 'name email avatar phone skills')
      .sort('-createdAt');

    // #region agent log
    if (typeof fetch !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/0e7bbb6d-51ac-4f13-911d-de5f9a6bdf29', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `log_${Date.now()}_APPLICATIONS_GET_SUCCESS`,
          runId: 'pre-fix-1',
          hypothesisId: 'H4',
          location: 'backend/routes/applications.js:125',
          message: 'GET /applications result',
          data: {
            userId: req.user?._id,
            role: req.user?.role,
            query,
            count: applications.length
          },
          timestamp: Date.now()
        })
      }).catch(() => {});
    }
    // #endregion

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('applicant', 'name email avatar phone skills experience education')
      .populate('employer', 'name company');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check authorization
    if (
      application.applicant._id.toString() !== req.user._id.toString() &&
      application.employer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/applications/:id
// @desc    Update application status (Employer only)
// @access  Private (Employers only)
router.put(
  '/:id',
  protect,
  authorize('employer'),
  async (req, res) => {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['applied', 'under_review', 'waitlist', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    try {
      const application = await Application.findById(req.params.id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // Check if user is the employer for this application
      if (application.employer.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this application'
        });
      }

      // Update status
      application.status = status;
      application.statusUpdates.push({
        status,
        timestamp: new Date(),
        note: note || ''
      });

      await application.save();

      // Populate the updated application
      await application.populate([
        { path: 'job', select: 'title company location' },
        { path: 'applicant', select: 'name email avatar' }
      ]);

      res.json({
        success: true,
        application
      });
    } catch (error) {
      console.error('Update application error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }
);

// @route   PUT /api/applications/:id/status
// @desc    Update application status (Employer only)
// @access  Private (Employers only)
router.put(
  '/:id/status',
  [
    protect,
    authorize('employer'),
    [
      body('status')
        .isIn(['applied', 'under_review', 'waitlist', 'accepted', 'rejected'])
        .withMessage('Invalid status')
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { status, note } = req.body;

    try {
      const application = await Application.findById(req.params.id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // Check if user is the employer for this application
      if (application.employer.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this application'
        });
      }

      // Update status
      application.status = status;
      application.statusUpdates.push({
        status,
        timestamp: new Date(),
        note
      });

      await application.save();

      res.json({
        success: true,
        application
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

// @route   PUT /api/applications/:id/withdraw
// @desc    Withdraw application (Job seeker only)
// @access  Private (Job seekers only)
router.put('/:id/withdraw', protect, authorize('jobseeker'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is the applicant
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application'
      });
    }

    application.status = 'withdrawn';
    application.statusUpdates.push({
      status: 'withdrawn',
      timestamp: new Date()
    });

    await application.save();

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
