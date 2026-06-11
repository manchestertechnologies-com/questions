const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionNumber: {
    type: Number,
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  options: {
    A: {
      text: { type: String, default: '' },
      image: { type: String, default: null } // Option A specific image if uploaded
    },
    B: {
      text: { type: String, default: '' },
      image: { type: String, default: null }
    },
    C: {
      text: { type: String, default: '' },
      image: { type: String, default: null }
    },
    D: {
      text: { type: String, default: '' },
      image: { type: String, default: null }
    }
  },
  correctAnswer: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D'],
  },
  explanation: {
    type: String,
    default: '',
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true,
  },
  concept: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Concept',
    required: true,
  },
  subConcept: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubConcept',
    required: true,
  },
  classNum: {
    type: Number,
    required: true,
    enum: [11, 12],
  },
  examType: {
    type: [String],
    required: true,
    // e.g. ['JEE', 'NEET', 'KCET', 'Board']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard'],
  },
  marks: {
    type: Number,
    default: 4,
  },
  negativeMarks: {
    type: Number,
    default: 1,
  },
  imageSlots: [
    {
      slotId: {
        type: String,
        required: true,
        // Format example: 'questionText_0', 'optionA_0', 'explanation_0'
      },
      url: {
        type: String,
        default: null, // Null indicates the slot is empty and needs an admin upload
      }
    }
  ],
  createdDate: {
    type: Date,
    default: Date.now,
  },
  updatedDate: {
    type: Date,
    default: Date.now,
  }
});

// Create indexes for fast filtering and searching
QuestionSchema.index({ subject: 1, chapter: 1, concept: 1 });
QuestionSchema.index({ classNum: 1, difficulty: 1 });
QuestionSchema.index({ examType: 1 });
QuestionSchema.index({ questionNumber: 1 });

module.exports = mongoose.model('Question', QuestionSchema);
