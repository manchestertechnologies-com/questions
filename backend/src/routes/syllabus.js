const express = require('express');
const router = express.Router();
const { getSubjects, getChapters, getConcepts, getSubConcepts, getSyllabusTree } = require('../controllers/syllabusController');
const { protect } = require('../middleware/auth');

// Protect all routes so only authorized users (admin and students) can query syllabus details
router.use(protect);

router.get('/subjects', getSubjects);
router.get('/chapters', getChapters);
router.get('/concepts', getConcepts);
router.get('/subconcepts', getSubConcepts);
router.get('/tree/:subjectId', getSyllabusTree);

module.exports = router;
