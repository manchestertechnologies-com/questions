const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Concept = require('../models/Concept');
const SubConcept = require('../models/SubConcept');

/**
 * @desc    Get all subjects (optionally filtered by classNum)
 * @route   GET /api/syllabus/subjects
 * @access  Private
 */
exports.getSubjects = async (req, res) => {
  const { classNum } = req.query;
  const filter = {};
  if (classNum) {
    filter.classNum = parseInt(classNum, 10);
  }

  try {
    const subjects = await Subject.find(filter).sort({ name: 1 });
    res.status(200).json({ success: true, count: subjects.length, subjects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Get chapters of a subject
 * @route   GET /api/syllabus/chapters
 * @access  Private
 */
exports.getChapters = async (req, res) => {
  const { subjectId } = req.query;
  if (!subjectId) {
    return res.status(400).json({ success: false, error: 'Please specify subjectId parameter' });
  }

  try {
    const chapters = await Chapter.find({ subject: subjectId }).sort({ name: 1 });
    res.status(200).json({ success: true, count: chapters.length, chapters });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Get concepts of a chapter
 * @route   GET /api/syllabus/concepts
 * @access  Private
 */
exports.getConcepts = async (req, res) => {
  const { chapterId } = req.query;
  if (!chapterId) {
    return res.status(400).json({ success: false, error: 'Please specify chapterId parameter' });
  }

  try {
    const concepts = await Concept.find({ chapter: chapterId }).sort({ name: 1 });
    res.status(200).json({ success: true, count: concepts.length, concepts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Get subconcepts of a concept
 * @route   GET /api/syllabus/subconcepts
 * @access  Private
 */
exports.getSubConcepts = async (req, res) => {
  const { conceptId } = req.query;
  if (!conceptId) {
    return res.status(400).json({ success: false, error: 'Please specify conceptId parameter' });
  }

  try {
    const subConcepts = await SubConcept.find({ concept: conceptId }).sort({ name: 1 });
    res.status(200).json({ success: true, count: subConcepts.length, subConcepts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Get the full nested syllabus tree for a specific subject
 * @route   GET /api/syllabus/tree/:subjectId
 * @access  Private
 */
exports.getSyllabusTree = async (req, res) => {
  const { subjectId } = req.params;

  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    const chapters = await Chapter.find({ subject: subjectId }).sort({ name: 1 });
    const fullTree = [];

    for (const chapter of chapters) {
      const concepts = await Concept.find({ chapter: chapter._id }).sort({ name: 1 });
      const conceptNodes = [];

      for (const concept of concepts) {
        const subConcepts = await SubConcept.find({ concept: concept._id }).sort({ name: 1 });
        conceptNodes.push({
          id: concept._id,
          name: concept.name,
          subConcepts: subConcepts.map(sc => ({ id: sc._id, name: sc.name }))
        });
      }

      fullTree.push({
        id: chapter._id,
        name: chapter.name,
        concepts: conceptNodes
      });
    }

    res.status(200).json({
      success: true,
      subject: { id: subject._id, name: subject.name, classNum: subject.classNum },
      chapters: fullTree
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
