const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // References
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Application Details
  coverLetter: {
    type: String,
    required: true
  },
  resume: {
    type: String, // URL to resume file
    required: true
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: ['applied', 'under_review', 'waitlist', 'accepted', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  
  // Timeline
  appliedAt: {
    type: Date,
    default: Date.now
  },
  statusUpdates: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  
  // Additional Info
  answers: [{
    question: String,
    answer: String
  }],
  
  // Employer Notes
  employerNotes: {
    type: String,
    select: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Indexes
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true }); // Prevent duplicate applications
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ employer: 1, status: 1 });
applicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
