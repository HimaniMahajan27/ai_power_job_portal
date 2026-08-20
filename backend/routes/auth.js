const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Configure multer for profile uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images (JPG, PNG, GIF) and PDF files are allowed'));
    }
  }
});

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role').isIn(['jobseeker', 'employer']).withMessage('Invalid role')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role
      });

      // Generate token
      const token = generateToken(user._id);

      // Remove password from response
      user.password = undefined;

      res.status(201).json({
        success: true,
        token,
        user
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

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists (include password for comparison)
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if user has a password (not OAuth user)
      if (!user.password) {
        return res.status(401).json({
          success: false,
          message: 'Please login with Google'
        });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate token
      const token = generateToken(user._id);

      // Remove password from response
      user.password = undefined;

      res.json({
        success: true,
        token,
        user
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

// @route   GET /api/auth/google
// @desc    Start Google OAuth flow
// @access  Public
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate token
    const token = generateToken(req.user._id);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
  }
);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, (req, res) => {
  req.logout(() => {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Profile update request received');
    console.log('User ID:', req.user?._id);
    console.log('Request body:', req.body);
    console.log('Request files:', req.files ? Object.keys(req.files) : 'none');
    
    const userId = req.user._id;
    const {
      name,
      phone,
      city,
      state,
      country,
      professionalSummary,
      skills,
      education,
      experience,
      certifications
    } = req.body;

    // Find user
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update basic info
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (city || state || country) {
      user.location = {
        city: city || user.location?.city,
        state: state || user.location?.state,
        country: country || user.location?.country
      };
    }

    // Update professional summary
    if (professionalSummary) user.professionalSummary = professionalSummary;

    // Update avatar if provided
    if (req.files?.avatar) {
      const file = req.files.avatar[0];
      // Store file as base64
      user.avatar = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    // Update resume if provided
    if (req.files?.resume) {
      const file = req.files.resume[0];
      // Store resume as base64
      user.resumeFile = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    // Update skills - always parse as JSON if it's a string
    if (skills) {
      try {
        user.skills = typeof skills === 'string' ? JSON.parse(skills) : skills;
        console.log('Skills updated:', user.skills);
      } catch (parseErr) {
        console.error('Error parsing skills:', parseErr);
        return res.status(400).json({
          success: false,
          message: 'Invalid skills format'
        });
      }
    }

    // Update education
    if (education) {
      try {
        user.education = typeof education === 'string' ? JSON.parse(education) : education;
        console.log('Education updated:', user.education);
      } catch (parseErr) {
        console.error('Error parsing education:', parseErr);
        return res.status(400).json({
          success: false,
          message: 'Invalid education format'
        });
      }
    }

    // Update experience
    if (experience) {
      try {
        user.experience = typeof experience === 'string' ? JSON.parse(experience) : experience;
        console.log('Experience updated:', user.experience);
      } catch (parseErr) {
        console.error('Error parsing experience:', parseErr);
        return res.status(400).json({
          success: false,
          message: 'Invalid experience format'
        });
      }
    }

    // Update certifications
    if (certifications) {
      try {
        user.certifications = typeof certifications === 'string' ? JSON.parse(certifications) : certifications;
        console.log('Certifications updated:', user.certifications);
      } catch (parseErr) {
        console.error('Error parsing certifications:', parseErr);
        return res.status(400).json({
          success: false,
          message: 'Invalid certifications format'
        });
      }
    }

    // Save user
    console.log('Saving user...');
    user = await user.save();
    console.log('User saved successfully');

    // Return user without password
    user.password = undefined;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error - Full error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during profile update'
    });
  }
});

// @route   DELETE /api/auth/avatar
// @desc    Delete user avatar
// @access  Private
router.delete('/avatar', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.avatar = '';
    await user.save();

    res.json({
      success: true,
      message: 'Avatar deleted successfully'
    });
  } catch (error) {
    console.error('Avatar delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during avatar deletion'
    });
  }
});

module.exports = router;
