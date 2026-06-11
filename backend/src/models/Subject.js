const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
  },
  classNum: {
    type: Number,
    required: [true, 'Class (11 or 12) is required'],
    enum: [11, 12],
  }
});

// Avoid duplicate subjects per class
SubjectSchema.index({ name: 1, classNum: 1 }, { unique: true });

module.exports = mongoose.model('Subject', SubjectSchema);
