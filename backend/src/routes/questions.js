const express = require('express');
const router = express.Router();
const {
  createQuestion,
  importQuestions,
  listQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  uploadSlotImage,
  getStats,
  parseImport,
  bulkSaveQuestions,
  uploadTempImage,
  updateImageField,
  deleteImageField,
  bulkUpdateDifficulty,
  parseQuestionText,
  getAuditLogs,
  getSecurityEvents,
  logSecurityEvent,
} = require('../controllers/questionController');

const { protect, adminOnly } = require('../middleware/auth');
const { uploadDoc, uploadImage } = require('../middleware/upload');

// ─── IMPORTANT: Static routes MUST come before param routes (/:id) ────────────

// ─── Stats & Analytics ────────────────────────────────────────────────────────
router.get('/dashboard/stats', protect, adminOnly, getStats);
router.get('/audit-logs', protect, adminOnly, getAuditLogs);
router.get('/security-events', protect, adminOnly, getSecurityEvents);

// ─── Import & Parse ───────────────────────────────────────────────────────────
router.post('/import', protect, adminOnly, uploadDoc.single('file'), importQuestions);
router.post('/parse-import', protect, adminOnly, uploadDoc.single('file'), parseImport);
router.post('/parse-text', protect, adminOnly, parseQuestionText);
router.post('/bulk-save', protect, adminOnly, bulkSaveQuestions);

// ─── Difficulty Bulk Update ────────────────────────────────────────────────────
router.put('/bulk-difficulty', protect, adminOnly, bulkUpdateDifficulty);

// ─── Temp Image Upload ────────────────────────────────────────────────────────
router.post('/temp-upload', protect, adminOnly, uploadImage.single('image'), uploadTempImage);

// ─── Security Events ──────────────────────────────────────────────────────────
router.post('/security-event', protect, logSecurityEvent);

// ─── List & Create Questions ──────────────────────────────────────────────────
router.get('/', protect, listQuestions);
router.post('/', protect, adminOnly, createQuestion);

// ─── Param-based routes (/:id) — MUST be last ─────────────────────────────────
router.get('/:id', protect, getQuestionById);
router.put('/:id', protect, adminOnly, updateQuestion);
router.delete('/:id', protect, adminOnly, deleteQuestion);

// ─── Image Management (under /:id) ───────────────────────────────────────────
router.post('/:id/slots/:slotId', protect, adminOnly, uploadImage.single('image'), uploadSlotImage);
router.post('/:id/image-fields/:fieldName', protect, adminOnly, uploadImage.single('image'), updateImageField);
router.delete('/:id/image-fields/:fieldName', protect, adminOnly, deleteImageField);

module.exports = router;
