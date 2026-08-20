const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Participants
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Related to Application (optional)
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  
  // Message Content
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  
  // Attachments
  attachments: [{
    filename: String,
    url: String,
    size: Number
  }],
  
  // Status
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // Threading
  threadId: {
    type: String,
    index: true
  },
  inReplyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, read: 1 });
messageSchema.index({ threadId: 1, createdAt: 1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
