const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    // Not required because Google OAuth users won't have passwords
    select: false // Don't return password by default
  },
  
  // OAuth
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  
  // User Type
  role: {
    type: String,
    enum: ['jobseeker', 'employer'],
    default: 'jobseeker'
  },
  
  // Profile Details
  avatar: {
    type: String,
    default: ''
  },
  phone: String,
  location: {
    city: String,
    state: String,
    country: String
  },
  professionalSummary: String,
  
  // Job Seeker Specific
  resume: String, // File path or URL
  resumeFile: String, // Store resume as URL
  skills: [String],
  certifications: [{
    name: String,
    issuingOrganization: String,
    issueDate: Date,
    expiryDate: Date,
    credentialUrl: String
  }],
  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    graduationYear: Number,
    grade: String
  }],
  
  // Employer Specific
  company: {
    name: String,
    website: String,
    description: String,
    logo: String,
    industry: String,
    size: String
  },
  
  // AI Usage Limits
  aiUsage: {
    coverLetterCount: { type: Number, default: 0 },
    coverLetterResetDate: { type: Date, default: Date.now },
    practiceTestCount: { type: Number, default: 0 },
    practiceTestResetDate: { type: Date, default: Date.now }
  },

  // Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Note: email and googleId indexes are already created by unique: true in schema definition

module.exports = mongoose.model('User', userSchema);
