const mongoose = require('mongoose');

const SubConceptSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'SubConcept name is required'],
    trim: true,
  },
  concept: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Concept',
    required: true,
  }
});

// Index subconcept names within a concept
SubConceptSchema.index({ name: 1, concept: 1 }, { unique: true });

module.exports = mongoose.model('SubConcept', SubConceptSchema);
