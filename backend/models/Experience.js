const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  // Company Information
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  location: {
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    }
  },
  role: {
    type: String,
    required: [true, 'Role/Position is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 2000,
    max: new Date().getFullYear()
  },

  // Experience Details
  applicationStatus: {
    type: String,
    enum: ['Applied', 'Interview', 'Accepted', 'Rejected', 'No Response'],
    required: true
  },
  experienceText: {
    type: String,
    required: [true, 'Experience description is required'],
    minlength: [50, 'Experience must be at least 50 characters'],
    maxlength: [2000, 'Experience cannot exceed 2000 characters']
  },
  interviewProcess: {
    type: String,
    maxlength: [1000, 'Interview process description cannot exceed 1000 characters']
  },

  // Rating
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },

  // Author (for moderation, but displayed anonymously)
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: true
  },

  // Engagement
  helpfulCount: {
    type: Number,
    default: 0
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Additional Info
  tips: {
    type: String,
    maxlength: [500, 'Tips cannot exceed 500 characters']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Very Hard'],
    default: 'Medium'
  }
}, {
  timestamps: true
});

// Indexes for efficient searching
experienceSchema.index({ company: 1, year: -1 });
experienceSchema.index({ 'location.city': 1 });
experienceSchema.index({ role: 1 });
experienceSchema.index({ createdAt: -1 });
experienceSchema.index({ helpfulCount: -1 });

// Text index for searching
experienceSchema.index({
  company: 'text',
  role: 'text',
  'location.city': 'text',
  'location.country': 'text'
});

module.exports = mongoose.model('Experience', experienceSchema);
