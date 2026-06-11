const mongoose = require('mongoose');

const QuestionImageSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  slotId: {
    type: String,
    required: true, // e.g. 'questionText_0', 'optionA_0'
  },
  url: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    default: null, // Cloudinary public asset ID
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('QuestionImage', QuestionImageSchema);
