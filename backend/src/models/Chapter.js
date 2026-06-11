const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Chapter name is required'],
    trim: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  }
});

// Index chapter names within a subject
ChapterSchema.index({ name: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Chapter', ChapterSchema);
