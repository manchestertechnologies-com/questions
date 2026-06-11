const mongoose = require('mongoose');

const QuestionStatisticsSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
    unique: true,
  },
  timesAttempted: {
    type: Number,
    default: 0,
  },
  timesCorrect: {
    type: Number,
    default: 0,
  },
  timesIncorrect: {
    type: Number,
    default: 0,
  },
  averageTimeTaken: {
    type: Number,
    default: 0, // In seconds
  }
});

module.exports = mongoose.model('QuestionStatistics', QuestionStatisticsSchema);
