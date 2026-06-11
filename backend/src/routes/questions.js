const express = require('express');
const router = express.Router();
const {
  createQuestion,
  importQuestions,
  listQuestions,
  getQuestionById,
  updateQuestion,
  uploadSlotImage,
  getStats
} = require('../controllers/questionController');

const { protect, adminOnly } = require('../middleware/auth');
const { uploadDoc, uploadImage } = require('../middleware/upload');

// User protected paths
router.get('/', protect, listQuestions);
router.get('/:id', protect, getQuestionById);

// Admin-only paths
router.get('/dashboard/stats', protect, adminOnly, getStats);
router.post('/', protect, adminOnly, createQuestion);
router.post('/import', protect, adminOnly, uploadDoc.single('file'), importQuestions);
router.put('/:id', protect, adminOnly, updateQuestion);
router.post('/:id/slots/:slotId', protect, adminOnly, uploadImage.single('image'), uploadSlotImage);

module.exports = router;
