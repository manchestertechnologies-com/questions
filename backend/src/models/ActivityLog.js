const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    default: null,
  },
  action: {
    type: String,
    required: true,
    // Actions: LOGIN, LOGOUT, CREATE_QUESTION, UPDATE_QUESTION, DELETE_QUESTION,
    // IMPORT_QUESTIONS, UPLOAD_IMAGE_SLOT, DELETE_IMAGE, DIFFICULTY_CHANGE,
    // BULK_DIFFICULTY_CHANGE, SECURITY_VIOLATION, SESSION_EXPIRED
    index: true,
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info',
  },
  details: {
    type: String,
    default: '',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ipAddress: {
    type: String,
    default: '',
  },
  userAgent: {
    type: String,
    default: '',
  },
  sessionId: {
    type: String,
    default: '',
  },
  createdDate: {
    type: Date,
    default: Date.now,
    index: true,
  }
});

ActivityLogSchema.index({ userId: 1, createdDate: -1 });
ActivityLogSchema.index({ questionId: 1 });
ActivityLogSchema.index({ action: 1, createdDate: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
