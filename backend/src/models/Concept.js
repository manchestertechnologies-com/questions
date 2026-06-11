const mongoose = require('mongoose');

const ConceptSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Concept name is required'],
    trim: true,
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true,
  }
});

// Index concept names within a chapter
ConceptSchema.index({ name: 1, chapter: 1 }, { unique: true });

module.exports = mongoose.model('Concept', ConceptSchema);
