const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Experience = require('../models/Experience');
const { protect } = require('../middleware/auth');

// @route   GET /api/experiences
// @desc    Get all experiences with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { company, location, role, year, sortBy = '-createdAt' } = req.query;

    // Build query
    let query = {};

    if (company) {
      query.company = { $regex: company, $options: 'i' };
    }

    if (location) {
      query.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = { $regex: role, $options: 'i' };
    }

    if (year) {
      query.year = parseInt(year);
    }

    // Fetch experiences (exclude author details for anonymity)
    const experiences = await Experience.find(query)
      .select('-author -helpfulBy')
      .sort(sortBy)
      .limit(100);

    res.json({
      success: true,
      count: experiences.length,
      experiences
    });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/experiences/stats
// @desc    Get statistics for filters
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    // Get unique companies
    const companies = await Experience.distinct('company');

    // Get unique locations
    const cities = await Experience.distinct('location.city');

    // Get unique roles
    const roles = await Experience.distinct('role');

    // Get year range
    const years = await Experience.distinct('year');

    res.json({
      success: true,
      stats: {
        companies: companies.sort(),
        cities: cities.sort(),
        roles: roles.sort(),
        years: years.sort((a, b) => b - a) // Descending
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/experiences
// @desc    Create a new experience
// @access  Private
router.post(
  '/',
  [
    protect,
    [
      body('company').trim().notEmpty().withMessage('Company name is required'),
      body('location.city').trim().notEmpty().withMessage('City is required'),
      body('location.country').trim().notEmpty().withMessage('Country is required'),
      body('role').trim().notEmpty().withMessage('Role is required'),
      body('year').isInt({ min: 2000, max: new Date().getFullYear() }).withMessage('Valid year is required'),
      body('applicationStatus').isIn(['Applied', 'Interview', 'Accepted', 'Rejected', 'No Response']).withMessage('Valid application status is required'),
      body('experienceText').trim().isLength({ min: 50, max: 2000 }).withMessage('Experience must be between 50 and 2000 characters'),
      body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const {
        company,
        location,
        role,
        year,
        applicationStatus,
        experienceText,
        interviewProcess,
        rating,
        tips,
        difficulty
      } = req.body;

      const experience = await Experience.create({
        company,
        location,
        role,
        year,
        applicationStatus,
        experienceText,
        interviewProcess,
        rating,
        tips,
        difficulty,
        author: req.user._id
      });

      res.status(201).json({
        success: true,
        experience: {
          _id: experience._id,
          company: experience.company,
          location: experience.location,
          role: experience.role,
          year: experience.year,
          applicationStatus: experience.applicationStatus,
          experienceText: experience.experienceText,
          interviewProcess: experience.interviewProcess,
          rating: experience.rating,
          tips: experience.tips,
          difficulty: experience.difficulty,
          helpfulCount: experience.helpfulCount,
          createdAt: experience.createdAt
        }
      });
    } catch (error) {
      console.error('Error creating experience:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating experience'
      });
    }
  }
);

// @route   PUT /api/experiences/:id/helpful
// @desc    Mark experience as helpful
// @access  Private
router.put('/:id/helpful', protect, async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    // Check if user already marked as helpful
    const alreadyHelpful = experience.helpfulBy.includes(req.user._id);

    if (alreadyHelpful) {
      // Remove from helpful
      experience.helpfulBy = experience.helpfulBy.filter(
        id => id.toString() !== req.user._id.toString()
      );
      experience.helpfulCount = Math.max(0, experience.helpfulCount - 1);
    } else {
      // Add to helpful
      experience.helpfulBy.push(req.user._id);
      experience.helpfulCount += 1;
    }

    await experience.save();

    res.json({
      success: true,
      helpful: !alreadyHelpful,
      helpfulCount: experience.helpfulCount
    });
  } catch (error) {
    console.error('Error marking helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
