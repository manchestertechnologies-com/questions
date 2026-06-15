const fs = require('fs');
const path = require('path');
const Question = require('../models/Question');
const QuestionImage = require('../models/QuestionImage');
const QuestionStatistics = require('../models/QuestionStatistics');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Concept = require('../models/Concept');
const SubConcept = require('../models/SubConcept');
const ActivityLog = require('../models/ActivityLog');
const SecurityEvent = require('../models/SecurityEvent');
const cloudinary = require('../config/cloudinary');
const { parseDocx } = require('../utils/htmlDocxParser');
const { parseDoc } = require('../utils/docParser');
const { parseJsonQuestions } = require('../utils/jsonParser');
const { parseRawQuestionText } = require('../utils/questionTextParser');

// ─── Image Upload Helper ──────────────────────────────────────────────────────
const uploadImageFile = async (file) => {
  const isCloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (isCloudinaryConfigured) {
    try {
      return await new Promise((resolve) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'manchester_questions' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary stream upload error:', error);
              resolve(fallbackUpload(file));
            } else {
              resolve({ url: result.secure_url, publicId: result.public_id });
            }
          }
        );
        uploadStream.end(file.buffer);
      });
    } catch (err) {
      console.error('Cloudinary stream upload catch error:', err);
      return fallbackUpload(file);
    }
  }

  return fallbackUpload(file);
};

const fallbackUpload = (file) => {
  const uploadDir = path.join(__dirname, '../../uploads');
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname).toLowerCase();
  const fileName = `${file.fieldname}-${uniqueSuffix}${ext}`;
  const filePath = path.join(uploadDir, fileName);

  try {
    // Attempt local file write
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.writeFileSync(filePath, file.buffer);
    return { url: `/uploads/${fileName}`, publicId: null };
  } catch (err) {
    // If local write fails (e.g. read-only filesystem on Vercel), fallback to base64 Data URI
    console.warn('Local upload directory not writable, falling back to base64 Data URI:', err.message);
    const base64Data = file.buffer.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${base64Data}`;
    return { url: dataUri, publicId: null };
  }
};

// ─── Helper: push to edit history ────────────────────────────────────────────
const recordEdit = (question, userId, summary) => {
  question.editHistory.push({ editedBy: userId, editedAt: new Date(), changesSummary: summary });
  question.modifiedBy = userId;
  question.updatedDate = Date.now();
};

// ─── Helper: log activity ─────────────────────────────────────────────────────
const logActivity = async (req, action, details, questionId = null, severity = 'info', metadata = {}) => {
  try {
    await ActivityLog.create({
      userId: req.user._id,
      questionId,
      action,
      details,
      severity,
      metadata,
      ipAddress: req.ip || req.connection?.remoteAddress || '',
      userAgent: req.headers['user-agent'] || '',
    });
  } catch (err) {
    console.error('Failed to write activity log:', err.message);
  }
};

// ─── Sync image slots ─────────────────────────────────────────────────────────
const syncImageSlots = (text, prefix, existingSlots) => {
  if (!text) return [];
  const matches = text.match(/\[\[(?:IMG|IMAGE)[ _]SLOT\]\]/gi);
  const count = matches ? matches.length : 0;
  const slots = [];
  const slotsArray = Array.isArray(existingSlots) ? existingSlots : [];
  for (let s = 0; s < count; s++) {
    const slotId = `${prefix}_${s}`;
    const match = slotsArray.find(sl => sl.slotId === slotId);
    slots.push({ slotId, url: match ? match.url : null });
  }
  return slots;
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Create a single question manually
 * @route   POST /api/questions
 * @access  Private (Admin Only)
 */
exports.createQuestion = async (req, res) => {
  try {
    const {
      questionNumber, title, questionType, questionText,
      optionA, optionB, optionC, optionD,
      correctAnswer, explanation,
      subject, chapter, concept, subConcept,
      classNum, examType, marks, negativeMarks,
      questionImage, optionAImage, optionBImage, optionCImage, optionDImage, solutionImage,
      tags, questionBank, topic, board,
    } = req.body;

    const slots = [];
    const addCustomSlots = (text, prefix) => {
      if (!text) return;
      const matches = text.match(/\[\[(?:IMG|IMAGE)[ _]SLOT\]\]/gi);
      const count = matches ? matches.length : 0;
      for (let s = 0; s < count; s++) {
        const slotId = `${prefix}_${s}`;
        let url = null;
        if (slotId === 'questionText_0') url = questionImage;
        if (slotId === 'optionA_0') url = optionAImage;
        if (slotId === 'optionB_0') url = optionBImage;
        if (slotId === 'optionC_0') url = optionCImage;
        if (slotId === 'optionD_0') url = optionDImage;
        if (slotId === 'explanation_0') url = solutionImage;
        slots.push({ slotId, url });
      }
    };

    if (questionImage) slots.push({ slotId: 'questionText_0', url: questionImage });
    if (optionAImage)  slots.push({ slotId: 'optionA_0', url: optionAImage });
    if (optionBImage)  slots.push({ slotId: 'optionB_0', url: optionBImage });
    if (optionCImage)  slots.push({ slotId: 'optionC_0', url: optionCImage });
    if (optionDImage)  slots.push({ slotId: 'optionD_0', url: optionDImage });
    if (solutionImage) slots.push({ slotId: 'explanation_0', url: solutionImage });

    addCustomSlots(questionText, 'questionText');
    addCustomSlots(optionA, 'optionA');
    addCustomSlots(optionB, 'optionB');
    addCustomSlots(optionC, 'optionC');
    addCustomSlots(optionD, 'optionD');
    addCustomSlots(explanation, 'explanation');

    const uniqueSlots = [];
    slots.forEach(s => {
      const existingIdx = uniqueSlots.findIndex(x => x.slotId === s.slotId);
      if (existingIdx !== -1) {
        if (!uniqueSlots[existingIdx].url && s.url) {
          uniqueSlots[existingIdx].url = s.url;
        }
      } else {
        uniqueSlots.push(s);
      }
    });

    const question = await Question.create({
      questionNumber: parseInt(questionNumber, 10),
      title: title || `Question ${questionNumber}`,
      questionType: questionType || 'MCQ',
      questionText,
      options: {
        A: { text: optionA || '', image: optionAImage || null },
        B: { text: optionB || '', image: optionBImage || null },
        C: { text: optionC || '', image: optionCImage || null },
        D: { text: optionD || '', image: optionDImage || null },
      },
      correctAnswer: correctAnswer || '',
      explanation: explanation || '',
      questionImage: questionImage || null,
      optionAImage: optionAImage || null,
      optionBImage: optionBImage || null,
      optionCImage: optionCImage || null,
      optionDImage: optionDImage || null,
      solutionImage: solutionImage || null,
      imageSlots: uniqueSlots,
      subject, chapter, concept,
      subConcept: subConcept || null,
      classNum: classNum ? parseInt(classNum, 10) : null,
      examType: Array.isArray(examType) ? examType : (examType ? [examType] : []),
      // difficulty intentionally NOT set — defaults to null
      marks: parseInt(marks, 10) || 4,
      negativeMarks: parseInt(negativeMarks, 10) || 1,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      questionBank: questionBank || '',
      topic: topic || '',
      board: board || '',
      createdBy: req.user._id,
      modifiedBy: req.user._id,
    });

    await QuestionStatistics.create({ questionId: question._id });
    await logActivity(req, 'CREATE_QUESTION', `Created question #${questionNumber}`, question._id);

    res.status(201).json({ success: true, question });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Upload document file and parse questions
 * @route   POST /api/questions/import
 * @access  Private (Admin Only)
 */
exports.importQuestions = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Please upload a file' });

  const { subject, chapter, concept, subConcept, classNum, examType, marks, negativeMarks, board, questionBank } = req.body;
  if (!subject || !chapter || !concept) {
    return res.status(400).json({ success: false, error: 'Please provide Subject, Chapter, and Concept' });
  }

  try {
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const fileBuffer = req.file.buffer;
    let parsedQuestions = [];

    if (fileExt === '.docx') parsedQuestions = await parseDocx(fileBuffer);
    else if (fileExt === '.doc') parsedQuestions = await parseDoc(fileBuffer);
    else if (fileExt === '.json') parsedQuestions = parseJsonQuestions(fileBuffer);
    else return res.status(400).json({ success: false, error: 'Unsupported format. Use .doc, .docx, or .json' });

    if (parsedQuestions.length === 0) {
      return res.status(400).json({ success: false, error: 'No questions could be extracted from the file.' });
    }

    const finalQuestions = parsedQuestions.map(q => ({
      ...q,
      subject, chapter, concept,
      subConcept: subConcept || null,
      classNum: classNum ? parseInt(classNum, 10) : null,
      examType: Array.isArray(examType) ? examType : (examType ? [examType] : (q.examType || [])),
      difficulty: null, // imported questions start unclassified
      marks: parseInt(marks, 10) || q.marks || 4,
      negativeMarks: parseInt(negativeMarks, 10) || q.negativeMarks || 1,
      board: board || '',
      questionBank: questionBank || '',
      createdBy: req.user._id,
      modifiedBy: req.user._id,
    }));

    const inserted = await Question.insertMany(finalQuestions);
    const statsObjects = inserted.map(q => ({ questionId: q._id }));
    await QuestionStatistics.insertMany(statsObjects);

    await logActivity(req, 'IMPORT_QUESTIONS',
      `Imported ${inserted.length} questions from ${req.file.originalname}`,
      null, 'info', { file: req.file.originalname, count: inserted.length });

    res.status(200).json({
      success: true, count: inserted.length,
      message: `Successfully imported ${inserted.length} questions.`,
      questions: inserted,
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Fetch questions with advanced search and pagination
 * @route   GET /api/questions
 * @access  Private
 */
exports.listQuestions = async (req, res) => {
  const {
    questionNumber, subject, chapter, concept, subConcept,
    difficulty, classNum, examType, keyword, questionType,
    tags, board, questionBank, topic, unclassified,
    dateFrom, dateTo, page = 1, limit = 20, sortBy = 'questionNumber', sortDir = 'asc'
  } = req.query;

  const query = {};
  if (questionNumber) query.questionNumber = parseInt(questionNumber, 10);
  if (subject) query.subject = subject;
  if (chapter) query.chapter = chapter;
  if (concept) query.concept = concept;
  if (subConcept) query.subConcept = subConcept;
  if (questionType) query.questionType = questionType;
  if (board) query.board = { $regex: board, $options: 'i' };
  if (questionBank) query.questionBank = { $regex: questionBank, $options: 'i' };
  if (topic) query.topic = { $regex: topic, $options: 'i' };
  if (tags) query.tags = { $in: tags.split(',').map(t => t.trim()) };
  if (classNum) query.classNum = parseInt(classNum, 10);
  if (examType) query.examType = { $in: [examType] };

  // Difficulty: filter by level or unclassified
  if (unclassified === 'true') {
    query.difficulty = null;
  } else if (difficulty) {
    query.difficulty = difficulty;
  }

  // Date range
  if (dateFrom || dateTo) {
    query.createdDate = {};
    if (dateFrom) query.createdDate.$gte = new Date(dateFrom);
    if (dateTo) query.createdDate.$lte = new Date(dateTo);
  }

  // Keyword: use text index or regex fallback
  if (keyword) {
    if (keyword.length > 2) {
      query.$text = { $search: keyword };
    } else {
      query.questionText = { $regex: keyword, $options: 'i' };
    }
  }

  try {
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);
    const skip = (pageNum - 1) * limitNum;
    const sortObj = { [sortBy]: sortDir === 'desc' ? -1 : 1 };

    const [total, questions] = await Promise.all([
      Question.countDocuments(query),
      Question.find(query)
        .populate('subject', 'name')
        .populate('chapter', 'name')
        .populate('concept', 'name')
        .populate('subConcept', 'name')
        .populate('createdBy', 'name email')
        .populate('modifiedBy', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    res.status(200).json({
      success: true, count: questions.length, total,
      pages: Math.ceil(total / limitNum), currentPage: pageNum, questions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Get detailed question by ID
 * @route   GET /api/questions/:id
 * @access  Private
 */
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('subject', 'name classNum')
      .populate('chapter', 'name')
      .populate('concept', 'name')
      .populate('subConcept', 'name')
      .populate('createdBy', 'name email')
      .populate('modifiedBy', 'name email')
      .populate('editHistory.editedBy', 'name email');

    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });
    res.status(200).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Update a question
 * @route   PUT /api/questions/:id
 * @access  Private (Admin Only)
 */
exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });

    const changes = [];
    const {
      title, questionType, questionText, optionA, optionB, optionC, optionD,
      correctAnswer, explanation, difficulty, marks, negativeMarks, examType,
      questionImage, optionAImage, optionBImage, optionCImage, optionDImage, solutionImage,
      tags, questionBank, topic, board, classNum,
    } = req.body;

    if (title !== undefined) { changes.push(`title`); question.title = title; }
    if (questionType !== undefined) { changes.push(`questionType`); question.questionType = questionType; }
    if (questionText !== undefined) { changes.push(`questionText`); question.questionText = questionText; }
    if (optionA !== undefined) question.options.A.text = optionA;
    if (optionB !== undefined) question.options.B.text = optionB;
    if (optionC !== undefined) question.options.C.text = optionC;
    if (optionD !== undefined) question.options.D.text = optionD;
    if (correctAnswer !== undefined) question.correctAnswer = correctAnswer;
    if (explanation !== undefined) question.explanation = explanation;
    if (marks !== undefined) question.marks = parseInt(marks, 10);
    if (negativeMarks !== undefined) question.negativeMarks = parseInt(negativeMarks, 10);
    if (examType !== undefined) question.examType = Array.isArray(examType) ? examType : [examType];
    if (classNum !== undefined) question.classNum = classNum ? parseInt(classNum, 10) : null;
    if (tags !== undefined) question.tags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
    if (questionBank !== undefined) question.questionBank = questionBank;
    if (topic !== undefined) question.topic = topic;
    if (board !== undefined) question.board = board;

    // Track difficulty changes separately
    if (difficulty !== undefined && difficulty !== question.difficulty) {
      const prevDiff = question.difficulty;
      question.difficulty = difficulty || null;
      changes.push(`difficulty: ${prevDiff} → ${difficulty}`);
      await logActivity(req, 'DIFFICULTY_CHANGE',
        `Changed difficulty from ${prevDiff || 'unclassified'} to ${difficulty || 'unclassified'} on question #${question.questionNumber}`,
        question._id, 'info', { from: prevDiff, to: difficulty });
    }

    // Image fields
    if (questionImage !== undefined) { question.questionImage = questionImage; changes.push('questionImage'); }
    if (optionAImage !== undefined) { question.optionAImage = optionAImage; question.options.A.image = optionAImage; }
    if (optionBImage !== undefined) { question.optionBImage = optionBImage; question.options.B.image = optionBImage; }
    if (optionCImage !== undefined) { question.optionCImage = optionCImage; question.options.C.image = optionCImage; }
    if (optionDImage !== undefined) { question.optionDImage = optionDImage; question.options.D.image = optionDImage; }
    if (solutionImage !== undefined) { question.solutionImage = solutionImage; }

    // Rebuild imageSlots
    const slots = [];
    const addCustomSlots = (text, prefix) => {
      if (!text) return;
      const matches = text.match(/\[\[(?:IMG|IMAGE)[ _]SLOT\]\]/gi);
      const count = matches ? matches.length : 0;
      for (let s = 0; s < count; s++) {
        const slotId = `${prefix}_${s}`;
        const existing = question.imageSlots?.find(sl => sl.slotId === slotId);
        slots.push({ slotId, url: existing ? existing.url : null });
      }
    };

    if (question.questionImage) slots.push({ slotId: 'questionText_0', url: question.questionImage });
    if (question.optionAImage)  slots.push({ slotId: 'optionA_0', url: question.optionAImage });
    if (question.optionBImage)  slots.push({ slotId: 'optionB_0', url: question.optionBImage });
    if (question.optionCImage)  slots.push({ slotId: 'optionC_0', url: question.optionCImage });
    if (question.optionDImage)  slots.push({ slotId: 'optionD_0', url: question.optionDImage });
    if (question.solutionImage) slots.push({ slotId: 'explanation_0', url: question.solutionImage });

    const standardKeys = ['questionText_0', 'optionA_0', 'optionB_0', 'optionC_0', 'optionD_0', 'explanation_0'];

    addCustomSlots(question.questionText, 'questionText');
    if (question.options?.A) addCustomSlots(question.options.A.text, 'optionA');
    if (question.options?.B) addCustomSlots(question.options.B.text, 'optionB');
    if (question.options?.C) addCustomSlots(question.options.C.text, 'optionC');
    if (question.options?.D) addCustomSlots(question.options.D.text, 'optionD');
    addCustomSlots(question.explanation, 'explanation');

    if (Array.isArray(question.imageSlots)) {
      question.imageSlots.forEach(s => {
        if (!standardKeys.includes(s.slotId) && !slots.some(x => x.slotId === s.slotId)) {
          slots.push(s);
        }
      });
    }
    question.imageSlots = slots;

    if (changes.length > 0) {
      recordEdit(question, req.user._id, `Updated: ${changes.join(', ')}`);
    }

    await question.save();
    await logActivity(req, 'UPDATE_QUESTION', `Updated question #${question.questionNumber}`, question._id);

    res.status(200).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Delete a question
 * @route   DELETE /api/questions/:id
 * @access  Private (Admin Only)
 */
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });

    await logActivity(req, 'DELETE_QUESTION',
      `Deleted question #${question.questionNumber} (${question.questionText.substring(0, 60)}...)`,
      question._id, 'warning');

    await Question.findByIdAndDelete(req.params.id);
    await QuestionStatistics.findOneAndDelete({ questionId: req.params.id });

    res.status(200).json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Bulk update difficulty for multiple questions
 * @route   PUT /api/questions/bulk-difficulty
 * @access  Private (Admin Only)
 */
exports.bulkUpdateDifficulty = async (req, res) => {
  try {
    const { questionIds, difficulty } = req.body;
    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide questionIds array' });
    }

    const validDifficulties = ['Easy', 'Medium', 'Hard', null];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({ success: false, error: 'Invalid difficulty value' });
    }

    const result = await Question.updateMany(
      { _id: { $in: questionIds } },
      {
        $set: {
          difficulty: difficulty || null,
          modifiedBy: req.user._id,
          updatedDate: Date.now(),
        },
        $push: {
          editHistory: {
            editedBy: req.user._id,
            editedAt: new Date(),
            changesSummary: `Bulk difficulty set to ${difficulty || 'unclassified'}`,
          }
        }
      }
    );

    await logActivity(req, 'BULK_DIFFICULTY_CHANGE',
      `Bulk set difficulty to "${difficulty || 'unclassified'}" for ${result.modifiedCount} questions`,
      null, 'info', { count: result.modifiedCount, difficulty, questionIds });

    res.status(200).json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Updated difficulty for ${result.modifiedCount} questions`,
    });
  } catch (error) {
    console.error('Bulk difficulty error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Parse raw pasted question text into structured format
 * @route   POST /api/questions/parse-text
 * @access  Private (Admin Only)
 */
exports.parseQuestionText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Please provide text to parse' });
    }
    const result = parseRawQuestionText(text);
    res.status(200).json(result);
  } catch (error) {
    console.error('Parse text error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Get audit logs with filters
 * @route   GET /api/questions/audit-logs
 * @access  Private (Admin Only)
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const {
      userId, action, questionId, severity,
      dateFrom, dateTo, page = 1, limit = 50
    } = req.query;

    const query = {};
    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (questionId) query.questionId = questionId;
    if (severity) query.severity = severity;
    if (dateFrom || dateTo) {
      query.createdDate = {};
      if (dateFrom) query.createdDate.$gte = new Date(dateFrom);
      if (dateTo) query.createdDate.$lte = new Date(dateTo);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 200);
    const skip = (pageNum - 1) * limitNum;

    const [total, logs] = await Promise.all([
      ActivityLog.countDocuments(query),
      ActivityLog.find(query)
        .populate('userId', 'name email role')
        .populate('questionId', 'questionNumber questionText')
        .sort({ createdDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    res.status(200).json({
      success: true, total, pages: Math.ceil(total / limitNum),
      currentPage: pageNum, logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Get security events
 * @route   GET /api/questions/security-events
 * @access  Private (Admin Only)
 */
exports.getSecurityEvents = async (req, res) => {
  try {
    const { userId, eventType, dateFrom, dateTo, page = 1, limit = 50 } = req.query;
    const query = {};
    if (userId) query.userId = userId;
    if (eventType) query.eventType = eventType;
    if (dateFrom || dateTo) {
      query.timestamp = {};
      if (dateFrom) query.timestamp.$gte = new Date(dateFrom);
      if (dateTo) query.timestamp.$lte = new Date(dateTo);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 200);
    const skip = (pageNum - 1) * limitNum;

    const [total, events] = await Promise.all([
      SecurityEvent.countDocuments(query),
      SecurityEvent.find(query)
        .populate('userId', 'name email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    res.status(200).json({ success: true, total, pages: Math.ceil(total / limitNum), currentPage: pageNum, events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Log a security event from the client
 * @route   POST /api/questions/security-event
 * @access  Private
 */
exports.logSecurityEvent = async (req, res) => {
  try {
    const { eventType, details, url } = req.body;
    const event = await SecurityEvent.create({
      userId: req.user._id,
      eventType: eventType || 'SUSPICIOUS_ACTIVITY',
      details: details || '',
      url: url || '',
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });

    await logActivity(req, 'SECURITY_VIOLATION',
      `Security event: ${eventType} — ${details}`,
      null, 'critical', { eventType, url });

    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Upload document and parse preview (no DB save)
 * @route   POST /api/questions/parse-import
 * @access  Private (Admin Only)
 */
exports.parseImport = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Please upload a file' });
  try {
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const fileBuffer = req.file.buffer;
    let parsedQuestions = [];

    if (fileExt === '.docx') parsedQuestions = await parseDocx(fileBuffer);
    else if (fileExt === '.doc') parsedQuestions = await parseDoc(fileBuffer);
    else if (fileExt === '.json') parsedQuestions = parseJsonQuestions(fileBuffer);
    else return res.status(400).json({ success: false, error: 'Unsupported file format.' });

    res.status(200).json({ success: true, questions: parsedQuestions });
  } catch (error) {
    console.error('Parse import error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Bulk save parsed questions array
 * @route   POST /api/questions/bulk-save
 * @access  Private (Admin Only)
 */
exports.bulkSaveQuestions = async (req, res) => {
  try {
    const { questions, subject, chapter, concept, subConcept, classNum, examType, marks, negativeMarks, board, questionBank } = req.body;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide questions array' });
    }

    const savedQuestions = [];
    for (const q of questions) {
      let slots = [];
      if (Array.isArray(q.imageSlots) && q.imageSlots.length > 0) {
        slots = q.imageSlots.map(s => ({
          slotId: s.slotId,
          url: s.url || null
        }));
      } else {
        const addCustomSlots = (text, prefix) => {
          if (!text) return;
          const matches = text.match(/\[\[(?:IMG|IMAGE)[ _]SLOT\]\]/gi);
          const count = matches ? matches.length : 0;
          for (let s = 0; s < count; s++) {
            const slotId = `${prefix}_${s}`;
            let url = null;
            if (slotId === 'questionText_0') url = q.questionImage;
            if (slotId === 'optionA_0') url = q.optionAImage;
            if (slotId === 'optionB_0') url = q.optionBImage;
            if (slotId === 'optionC_0') url = q.optionCImage;
            if (slotId === 'optionD_0') url = q.optionDImage;
            if (slotId === 'explanation_0') url = q.solutionImage;
            slots.push({ slotId, url });
          }
        };

        if (q.questionImage) slots.push({ slotId: 'questionText_0', url: q.questionImage });
        if (q.optionAImage)  slots.push({ slotId: 'optionA_0', url: q.optionAImage });
        if (q.optionBImage)  slots.push({ slotId: 'optionB_0', url: q.optionBImage });
        if (q.optionCImage)  slots.push({ slotId: 'optionC_0', url: q.optionCImage });
        if (q.optionDImage)  slots.push({ slotId: 'optionD_0', url: q.optionDImage });
        if (q.solutionImage) slots.push({ slotId: 'explanation_0', url: q.solutionImage });

        addCustomSlots(q.questionText, 'questionText');
        addCustomSlots(q.options?.A?.text || q.optionA, 'optionA');
        addCustomSlots(q.options?.B?.text || q.optionB, 'optionB');
        addCustomSlots(q.options?.C?.text || q.optionC, 'optionC');
        addCustomSlots(q.options?.D?.text || q.optionD, 'optionD');
        addCustomSlots(q.explanation, 'explanation');
      }

      const uniqueSlots = [];
      slots.forEach(s => {
        const existingIdx = uniqueSlots.findIndex(x => x.slotId === s.slotId);
        if (existingIdx !== -1) {
          if (!uniqueSlots[existingIdx].url && s.url) {
            uniqueSlots[existingIdx].url = s.url;
          }
        } else {
          uniqueSlots.push(s);
        }
      });

      let questionImage = q.questionImage || null;
      let optionAImage = q.optionAImage || null;
      let optionBImage = q.optionBImage || null;
      let optionCImage = q.optionCImage || null;
      let optionDImage = q.optionDImage || null;
      let solutionImage = q.solutionImage || null;

      uniqueSlots.forEach(s => {
        if (s.slotId === 'questionText_0') questionImage = s.url;
        if (s.slotId === 'optionA_0') optionAImage = s.url;
        if (s.slotId === 'optionB_0') optionBImage = s.url;
        if (s.slotId === 'optionC_0') optionCImage = s.url;
        if (s.slotId === 'optionD_0') optionDImage = s.url;
        if (s.slotId === 'explanation_0') solutionImage = s.url;
      });

      const newQuestion = await Question.create({
        questionNumber: parseInt(q.questionNumber, 10) || (savedQuestions.length + 1),
        title: q.title || `Question ${q.questionNumber || (savedQuestions.length + 1)}`,
        questionType: q.questionType || 'MCQ',
        questionText: q.questionText || 'Question text placeholder',
        options: {
          A: { text: q.options?.A?.text || q.optionA || '', image: optionAImage },
          B: { text: q.options?.B?.text || q.optionB || '', image: optionBImage },
          C: { text: q.options?.C?.text || q.optionC || '', image: optionCImage },
          D: { text: q.options?.D?.text || q.optionD || '', image: optionDImage },
        },
        correctAnswer: q.correctAnswer || 'A',
        explanation: q.explanation || '',
        questionImage,
        optionAImage,
        optionBImage,
        optionCImage,
        optionDImage,
        solutionImage,
        imageSlots: uniqueSlots,
        subject: subject || q.subject,
        chapter: chapter || q.chapter,
        concept: concept || q.concept,
        subConcept: subConcept || q.subConcept || null,
        classNum: classNum ? parseInt(classNum, 10) : (q.classNum ? parseInt(q.classNum, 10) : null),
        examType: Array.isArray(examType) ? examType : (q.examType || []),
        difficulty: null, // bulk saved questions start unclassified
        marks: parseInt(marks || q.marks, 10) || 4,
        negativeMarks: parseInt(negativeMarks || q.negativeMarks, 10) || 1,
        board: board || q.board || '',
        questionBank: questionBank || q.questionBank || '',
        tags: q.tags || [],
        createdBy: req.user._id,
        modifiedBy: req.user._id,
      });

      await QuestionStatistics.create({ questionId: newQuestion._id });
      savedQuestions.push(newQuestion);
    }

    await logActivity(req, 'IMPORT_QUESTIONS', `Bulk saved ${savedQuestions.length} questions`,
      null, 'info', { count: savedQuestions.length });

    res.status(201).json({ success: true, count: savedQuestions.length, questions: savedQuestions });
  } catch (error) {
    console.error('Bulk save error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Upload temp image
 * @route   POST /api/questions/temp-upload
 * @access  Private (Admin Only)
 */
exports.uploadTempImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Please upload an image file' });
  try {
    const uploadResult = await uploadImageFile(req.file);
    res.status(200).json({ success: true, url: uploadResult.url });
  } catch (error) {
    console.error('Temp upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Upload image for a specific slot
 * @route   POST /api/questions/:id/slots/:slotId
 * @access  Private (Admin Only)
 */
exports.uploadSlotImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Please upload an image' });
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });

    const { slotId } = req.params;
    const slotIndex = question.imageSlots.findIndex(s => s.slotId === slotId);
    if (slotIndex === -1) {
      return res.status(400).json({ success: false, error: `Image slot '${slotId}' does not exist` });
    }

    const uploadResult = await uploadImageFile(req.file);
    question.imageSlots[slotIndex].url = uploadResult.url;

    const slotIdMap = {
      'questionText_0': 'questionImage', 'optionA_0': 'optionAImage',
      'optionB_0': 'optionBImage', 'optionC_0': 'optionCImage',
      'optionD_0': 'optionDImage', 'explanation_0': 'solutionImage',
    };
    const mappedField = slotIdMap[slotId];
    if (mappedField) {
      question[mappedField] = uploadResult.url;
      if (mappedField === 'optionAImage') question.options.A.image = uploadResult.url;
      if (mappedField === 'optionBImage') question.options.B.image = uploadResult.url;
      if (mappedField === 'optionCImage') question.options.C.image = uploadResult.url;
      if (mappedField === 'optionDImage') question.options.D.image = uploadResult.url;
    }

    recordEdit(question, req.user._id, `Uploaded image to slot ${slotId}`);
    await question.save();

    await QuestionImage.create({
      questionId: question._id, slotId, url: uploadResult.url,
      publicId: uploadResult.publicId, uploadedBy: req.user._id,
    });

    await logActivity(req, 'UPLOAD_IMAGE_SLOT',
      `Uploaded image to slot '${slotId}' on question #${question.questionNumber}`,
      question._id);

    res.status(200).json({ success: true, url: uploadResult.url });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Upload image for a named field
 * @route   POST /api/questions/:id/image-fields/:fieldName
 * @access  Private (Admin Only)
 */
exports.updateImageField = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Please upload an image file' });
  try {
    const { id, fieldName } = req.params;
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });

    const validFields = ['questionImage', 'optionAImage', 'optionBImage', 'optionCImage', 'optionDImage', 'solutionImage'];
    if (!validFields.includes(fieldName)) {
      return res.status(400).json({ success: false, error: 'Invalid image field name' });
    }

    const uploadResult = await uploadImageFile(req.file);
    question[fieldName] = uploadResult.url;
    if (fieldName === 'optionAImage') question.options.A.image = uploadResult.url;
    if (fieldName === 'optionBImage') question.options.B.image = uploadResult.url;
    if (fieldName === 'optionCImage') question.options.C.image = uploadResult.url;
    if (fieldName === 'optionDImage') question.options.D.image = uploadResult.url;

    const slotIdMap = {
      questionImage: 'questionText_0', optionAImage: 'optionA_0',
      optionBImage: 'optionB_0', optionCImage: 'optionC_0',
      optionDImage: 'optionD_0', solutionImage: 'explanation_0',
    };
    const slotId = slotIdMap[fieldName];
    const slotIndex = question.imageSlots.findIndex(s => s.slotId === slotId);
    if (slotIndex !== -1) question.imageSlots[slotIndex].url = uploadResult.url;
    else question.imageSlots.push({ slotId, url: uploadResult.url });

    recordEdit(question, req.user._id, `Uploaded image for ${fieldName}`);
    await question.save();

    await logActivity(req, 'UPLOAD_IMAGE_SLOT',
      `Uploaded image to field ${fieldName} on question #${question.questionNumber}`,
      question._id);

    res.status(200).json({ success: true, url: uploadResult.url, question });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Delete image for a named field
 * @route   DELETE /api/questions/:id/image-fields/:fieldName
 * @access  Private (Admin Only)
 */
exports.deleteImageField = async (req, res) => {
  try {
    const { id, fieldName } = req.params;
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });

    const validFields = ['questionImage', 'optionAImage', 'optionBImage', 'optionCImage', 'optionDImage', 'solutionImage'];
    if (!validFields.includes(fieldName)) {
      return res.status(400).json({ success: false, error: 'Invalid image field name' });
    }

    question[fieldName] = null;
    if (fieldName === 'optionAImage') question.options.A.image = null;
    if (fieldName === 'optionBImage') question.options.B.image = null;
    if (fieldName === 'optionCImage') question.options.C.image = null;
    if (fieldName === 'optionDImage') question.options.D.image = null;

    const slotIdMap = {
      questionImage: 'questionText_0', optionAImage: 'optionA_0',
      optionBImage: 'optionB_0', optionCImage: 'optionC_0',
      optionDImage: 'optionD_0', solutionImage: 'explanation_0',
    };
    const slotId = slotIdMap[fieldName];
    question.imageSlots = question.imageSlots.filter(s => s.slotId !== slotId);

    recordEdit(question, req.user._id, `Deleted image for ${fieldName}`);
    await question.save();

    await logActivity(req, 'DELETE_IMAGE',
      `Deleted image from ${fieldName} on question #${question.questionNumber}`,
      question._id, 'warning');

    res.status(200).json({ success: true, message: 'Image removed successfully', question });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Delete image for a specific slot
 * @route   DELETE /api/questions/:id/slots/:slotId
 * @access  Private (Admin Only)
 */
exports.deleteSlotImage = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });

    const { slotId } = req.params;
    const slotIndex = question.imageSlots.findIndex(s => s.slotId === slotId);
    if (slotIndex !== -1) {
      question.imageSlots[slotIndex].url = null;
    }

    const slotIdMap = {
      'questionText_0': 'questionImage', 'optionA_0': 'optionAImage',
      'optionB_0': 'optionBImage', 'optionC_0': 'optionCImage',
      'optionD_0': 'optionDImage', 'explanation_0': 'solutionImage',
    };
    const mappedField = slotIdMap[slotId];
    if (mappedField) {
      question[mappedField] = null;
      if (mappedField === 'optionAImage') question.options.A.image = null;
      if (mappedField === 'optionBImage') question.options.B.image = null;
      if (mappedField === 'optionCImage') question.options.C.image = null;
      if (mappedField === 'optionDImage') question.options.D.image = null;
    }

    recordEdit(question, req.user._id, `Deleted image for slot ${slotId}`);
    await question.save();

    await logActivity(req, 'DELETE_IMAGE',
      `Deleted image from slot '${slotId}' on question #${question.questionNumber}`,
      question._id, 'warning');

    res.status(200).json({ success: true, message: 'Image removed from slot successfully', question });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Admin stats and dashboard analytics
 * @route   GET /api/questions/dashboard/stats
 * @access  Private (Admin Only)
 */
exports.getStats = async (req, res) => {
  try {
    const totalQuestions = await Question.countDocuments();
    const unclassifiedCount = await Question.countDocuments({ difficulty: null });

    const difficultyStats = await Question.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);
    const difficulty = { Easy: 0, Medium: 0, Hard: 0, Unclassified: 0 };
    difficultyStats.forEach(stat => {
      if (stat._id === null) difficulty.Unclassified = stat.count;
      else if (stat._id) difficulty[stat._id] = stat.count;
    });

    const examStats = await Question.aggregate([
      { $unwind: '$examType' },
      { $group: { _id: '$examType', count: { $sum: 1 } } }
    ]);
    const examWise = {};
    examStats.forEach(stat => { if (stat._id) examWise[stat._id] = stat.count; });

    const subjectStats = await Question.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'subjects', localField: '_id', foreignField: '_id', as: 'subjectDetails'
        }
      },
      { $unwind: '$subjectDetails' },
      {
        $project: {
          name: '$subjectDetails.name',
          classNum: '$subjectDetails.classNum',
          count: 1,
        }
      },
      { $sort: { count: -1 } },
    ]);

    const questionTypeStats = await Question.aggregate([
      { $group: { _id: '$questionType', count: { $sum: 1 } } }
    ]);
    const questionTypes = {};
    questionTypeStats.forEach(stat => { if (stat._id) questionTypes[stat._id] = stat.count; });

    const pendingImageCount = await Question.countDocuments({
      $or: [
        { 'imageSlots': { $elemMatch: { url: null } } }
      ]
    });

    const recentUploads = await Question.find()
      .populate('subject', 'name')
      .sort({ createdDate: -1 })
      .limit(10)
      .select('questionNumber subject difficulty createdDate questionType')
      .lean();

    const recentActivity = await ActivityLog.find()
      .populate('userId', 'name email')
      .populate('questionId', 'questionNumber')
      .sort({ createdDate: -1 })
      .limit(15)
      .lean();

    res.status(200).json({
      success: true,
      stats: {
        totalQuestions, unclassifiedCount, difficulty, examWise,
        subjectStats, questionTypes, pendingImageCount, recentUploads, recentActivity,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
