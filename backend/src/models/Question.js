const mongoose = require('mongoose');

const EditHistorySchema = new mongoose.Schema({
  editedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  editedAt: {
    type: Date,
    default: Date.now,
  },
  changesSummary: {
    type: String,
    default: '',
  }
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
  questionNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  questionType: {
    type: String,
    enum: ['MCQ', 'Numerical', 'Assertion-Reason', 'Match-Following', 'Multiple-Correct', 'Descriptive', 'Case-Study'],
    default: 'MCQ',
  },
  questionText: {
    type: String,
    required: true,
  },
  questionImage: {
    type: String,
    default: null,
  },
  optionAImage: {
    type: String,
    default: null,
  },
  optionBImage: {
    type: String,
    default: null,
  },
  optionCImage: {
    type: String,
    default: null,
  },
  optionDImage: {
    type: String,
    default: null,
  },
  solutionImage: {
    type: String,
    default: null,
  },
  options: {
    A: {
      text: { type: String, default: '' },
      image: { type: String, default: null }
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
  // Flexible correctAnswer: 'A','B','C','D' for MCQ; numeric string for Numerical; free text for others
  correctAnswer: {
    type: String,
    default: '',
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
    required: false,
  },
  // difficulty is now OPTIONAL — assigned separately via Difficulty Manager
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', null],
    default: null,
  },
  // classNum expanded beyond 11/12
  classNum: {
    type: Number,
    required: false,
    default: null,
  },
  examType: {
    type: [String],
    default: [],
    // e.g. ['JEE', 'NEET', 'KCET', 'Board', 'UPSC', 'CET']
  },
  marks: {
    type: Number,
    default: 4,
  },
  negativeMarks: {
    type: Number,
    default: 1,
  },
  // Tags for flexible categorisation
  tags: {
    type: [String],
    default: [],
  },
  // Optional question bank name / set
  questionBank: {
    type: String,
    default: '',
  },
  // Topic (5th hierarchy level, optional)
  topic: {
    type: String,
    default: '',
  },
  // Board: CBSE, ICSE, State Board, etc.
  board: {
    type: String,
    default: '',
  },
  imageSlots: [
    {
      slotId: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        default: null,
      }
    }
  ],
  // Edit History for full audit trail
  editHistory: {
    type: [EditHistorySchema],
    default: [],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  updatedDate: {
    type: Date,
    default: Date.now,
  }
});

// Full-text search index
QuestionSchema.index({ questionText: 'text', explanation: 'text', tags: 'text' });

// Performance indexes
QuestionSchema.index({ subject: 1, chapter: 1, concept: 1 });
QuestionSchema.index({ difficulty: 1 });
QuestionSchema.index({ examType: 1 });
QuestionSchema.index({ questionNumber: 1 });
QuestionSchema.index({ questionType: 1 });
QuestionSchema.index({ board: 1 });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ createdDate: -1 });
QuestionSchema.index({ difficulty: 1, subject: 1 });

module.exports = mongoose.model('Question', QuestionSchema);
