const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  // Job Details
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: [String],
  responsibilities: [String],
  
  // Employment Details
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    required: true
  },
  experienceLevel: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
    required: true
  },
  
  // Location
  location: {
    city: String,
    state: String,
    country: String,
    remote: {
      type: Boolean,
      default: false
    },
    hybrid: {
      type: Boolean,
      default: false
    }
  },
  
  // Salary
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly'
    }
  },
  
  // Skills & Categories
  skills: [String],
  category: {
    type: String,
    required: true
  },
  
  // Employer Reference
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Application Details
  applicationDeadline: Date,
  applicationsCount: {
    type: Number,
    default: 0
  },

  // Custom Application Form Fields
  // Resume and Cover Letter are always included by default
  applicationFields: [{
    fieldName: { type: String, required: true },
    fieldType: { type: String, enum: ['text', 'textarea', 'url', 'number', 'date', 'select'], default: 'text' },
    required: { type: Boolean, default: false },
    options: [String] // For select type fields
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  
  // SEO & Meta
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for search optimization
jobSchema.index({ title: 'text', description: 'text', company: 'text' });
jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ employer: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
