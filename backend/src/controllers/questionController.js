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
const cloudinary = require('../config/cloudinary');
const { parseDocx } = require('../utils/docxParser');
const { parseDoc } = require('../utils/docParser');
const { parseJsonQuestions } = require('../utils/jsonParser');

// Utility to upload images to Cloudinary, falling back to local static hosting if keys are not set
const uploadImageFile = async (filePath) => {
  const isCloudinaryConfigured = 
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET;

  if (!isCloudinaryConfigured) {
    console.log('Cloudinary not configured. Serving upload locally.');
    const fileName = path.basename(filePath);
    return {
      url: `/uploads/${fileName}`,
      publicId: null
    };
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'manchester_questions'
    });
    
    // Clean up local temp file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    const fileName = path.basename(filePath);
    return {
      url: `/uploads/${fileName}`,
      publicId: null
    };
  }
};

/**
 * Helper to rebuild/extend image slots when editing text
 */
const syncImageSlots = (text, prefix, existingSlots) => {
  if (!text) return [];
  const matches = text.match(/\[\[IMG_SLOT\]\]/g);
  const count = matches ? matches.length : 0;
  
  const slots = [];
  for (let s = 0; s < count; s++) {
    const slotId = `${prefix}_${s}`;
    // Preserve URL if this slot already has one uploaded
    const match = existingSlots.find(sl => sl.slotId === slotId);
    slots.push({
      slotId,
      url: match ? match.url : null
    });
  }
  return slots;
};

/**
 * @desc    Create a single question manually
 * @route   POST /api/questions
 * @access  Private (Admin Only)
 */
exports.createQuestion = async (req, res) => {
  try {
    const {
      questionNumber,
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      explanation,
      subject,
      chapter,
      concept,
      subConcept,
      classNum,
      examType,
      difficulty,
      marks,
      negativeMarks
    } = req.body;

    // Build fresh image slots based on placeholders
    const imageSlots = [
      ...syncImageSlots(questionText, 'questionText', []),
      ...syncImageSlots(optionA, 'optionA', []),
      ...syncImageSlots(optionB, 'optionB', []),
      ...syncImageSlots(optionC, 'optionC', []),
      ...syncImageSlots(optionD, 'optionD', []),
      ...syncImageSlots(explanation, 'explanation', [])
    ];

    const question = await Question.create({
      questionNumber: parseInt(questionNumber, 10),
      questionText,
      options: {
        A: { text: optionA },
        B: { text: optionB },
        C: { text: optionC },
        D: { text: optionD }
      },
      correctAnswer,
      explanation,
      subject,
      chapter,
      concept,
      subConcept,
      classNum: parseInt(classNum, 10),
      examType: Array.isArray(examType) ? examType : [examType],
      difficulty,
      marks: parseInt(marks, 10) || 4,
      negativeMarks: parseInt(negativeMarks, 10) || 1,
      imageSlots
    });

    // Create Statistics
    await QuestionStatistics.create({ questionId: question._id });

    // Log Activity
    await ActivityLog.create({
      userId: req.user._id,
      action: 'CREATE_QUESTION',
      details: `Created question number ${questionNumber} under subject ${subject}`
    });

    res.status(201).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Upload document file and parse questions
 * @route   POST /api/questions/import
 * @access  Private (Admin Only)
 */
exports.importQuestions = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Please upload a file' });
  }

  const { subject, chapter, concept, subConcept, classNum, examType, difficulty, marks, negativeMarks } = req.body;

  if (!subject || !chapter || !concept || !subConcept || !classNum) {
    return res.status(400).json({ success: false, error: 'Please provide all mapping targets (Subject, Chapter, Concept, Sub-concept, and Class)' });
  }

  try {
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const fileBuffer = req.file.buffer;
    let parsedQuestions = [];

    if (fileExt === '.docx') {
      parsedQuestions = await parseDocx(fileBuffer);
    } else if (fileExt === '.doc') {
      parsedQuestions = await parseDoc(fileBuffer);
    } else if (fileExt === '.json') {
      parsedQuestions = parseJsonQuestions(fileBuffer);
    } else {
      return res.status(400).json({ success: false, error: 'Unsupported file format. Use .doc, .docx, or .json' });
    }

    if (parsedQuestions.length === 0) {
      return res.status(400).json({ success: false, error: 'No questions could be extracted from the file. Please check the file formatting.' });
    }

    // Apply targets metadata and save questions
    const finalQuestions = parsedQuestions.map(q => ({
      ...q,
      subject,
      chapter,
      concept,
      subConcept,
      classNum: parseInt(classNum, 10),
      examType: Array.isArray(examType) ? examType : (req.body.examType ? [req.body.examType] : q.examType),
      difficulty: difficulty || q.difficulty,
      marks: parseInt(marks, 10) || q.marks || 4,
      negativeMarks: parseInt(negativeMarks, 10) || q.negativeMarks || 1
    }));

    const inserted = await Question.insertMany(finalQuestions);

    // Seed stats for all inserted questions
    const statsObjects = inserted.map(q => ({ questionId: q._id }));
    await QuestionStatistics.insertMany(statsObjects);

    // Log Activity
    await ActivityLog.create({
      userId: req.user._id,
      action: 'IMPORT_QUESTIONS',
      details: `Imported ${inserted.length} questions from ${req.file.originalname} into subject ${subject}`
    });

    res.status(200).json({
      success: true,
      count: inserted.length,
      message: `Successfully preloaded ${inserted.length} questions.`,
      questions: inserted
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Fetch lists of questions with search and pagination (Optimized for 100k+)
 * @route   GET /api/questions
 * @access  Private
 */
exports.listQuestions = async (req, res) => {
  const {
    questionNumber,
    subject,
    chapter,
    concept,
    subConcept,
    difficulty,
    classNum,
    examType,
    keyword,
    page = 1,
    limit = 10
  } = req.query;

  const query = {};

  if (questionNumber) {
    query.questionNumber = parseInt(questionNumber, 10);
  }
  if (subject) query.subject = subject;
  if (chapter) query.chapter = chapter;
  if (concept) query.concept = concept;
  if (subConcept) query.subConcept = subConcept;
  if (difficulty) query.difficulty = difficulty;
  if (classNum) query.classNum = parseInt(classNum, 10);
  if (examType) query.examType = { $in: [examType] };
  if (keyword) {
    query.questionText = { $regex: keyword, $options: 'i' };
  }

  try {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Run count and query in parallel
    const [total, questions] = await Promise.all([
      Question.countDocuments(query),
      Question.find(query)
        .populate('subject', 'name')
        .populate('chapter', 'name')
        .populate('concept', 'name')
        .populate('subConcept', 'name')
        .sort({ questionNumber: 1 })
        .skip(skip)
        .limit(limitNum)
    ]);

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      questions
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
      .populate('subConcept', 'name');

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

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
    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    const {
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      explanation,
      difficulty,
      marks,
      negativeMarks,
      examType
    } = req.body;

    // Sync image slots: keep old ones that map to active slots, remove deleted ones, create new empty slots
    const updatedSlots = [
      ...syncImageSlots(questionText || question.questionText, 'questionText', question.imageSlots),
      ...syncImageSlots(optionA || question.options.A.text, 'optionA', question.imageSlots),
      ...syncImageSlots(optionB || question.options.B.text, 'optionB', question.imageSlots),
      ...syncImageSlots(optionC || question.options.C.text, 'optionC', question.imageSlots),
      ...syncImageSlots(optionD || question.options.D.text, 'optionD', question.imageSlots),
      ...syncImageSlots(explanation || question.explanation, 'explanation', question.imageSlots)
    ];

    question.questionText = questionText || question.questionText;
    question.options.A.text = optionA || question.options.A.text;
    question.options.B.text = optionB || question.options.B.text;
    question.options.C.text = optionC || question.options.C.text;
    question.options.D.text = optionD || question.options.D.text;
    question.correctAnswer = correctAnswer || question.correctAnswer;
    question.explanation = explanation || question.explanation;
    question.difficulty = difficulty || question.difficulty;
    question.marks = marks ? parseInt(marks, 10) : question.marks;
    question.negativeMarks = negativeMarks ? parseInt(negativeMarks, 10) : question.negativeMarks;
    question.examType = examType ? (Array.isArray(examType) ? examType : [examType]) : question.examType;
    question.imageSlots = updatedSlots;
    question.updatedDate = Date.now();

    await question.save();

    res.status(200).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Upload an image for a specific question slot
 * @route   POST /api/questions/:id/slots/:slotId
 * @access  Private (Admin Only)
 */
exports.uploadSlotImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Please upload an image' });
  }

  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    const { slotId } = req.params;
    
    // Validate slot exists
    const slotIndex = question.imageSlots.findIndex(s => s.slotId === slotId);
    if (slotIndex === -1) {
      return res.status(400).json({ success: false, error: `Image slot '${slotId}' does not exist in this question` });
    }

    // Upload to Cloudinary / local
    const uploadResult = await uploadImageFile(req.file.path);

    // Save mapping inside question schema
    question.imageSlots[slotIndex].url = uploadResult.url;
    await question.save();

    // Log the image asset upload details
    const questionImage = await QuestionImage.create({
      questionId: question._id,
      slotId: slotId,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      uploadedBy: req.user._id
    });

    // Log Activity
    await ActivityLog.create({
      userId: req.user._id,
      action: 'UPLOAD_IMAGE_SLOT',
      details: `Uploaded image to slot '${slotId}' on question id ${question._id}`
    });

    res.status(200).json({
      success: true,
      message: 'Image uploaded and linked successfully.',
      url: uploadResult.url,
      questionImage
    });
  } catch (error) {
    console.error('Slot upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Fetch admin stats and graphical data
 * @route   GET /api/questions/stats
 * @access  Private (Admin Only)
 */
exports.getStats = async (req, res) => {
  try {
    // 1. Total Questions
    const totalQuestions = await Question.countDocuments();

    // 2. Count by Difficulty
    const difficultyStats = await Question.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);
    const difficulty = { Easy: 0, Medium: 0, Hard: 0 };
    difficultyStats.forEach(stat => {
      if (stat._id) difficulty[stat._id] = stat.count;
    });

    // 3. Count by Exam Type
    const examStats = await Question.aggregate([
      { $unwind: '$examType' },
      { $group: { _id: '$examType', count: { $sum: 1 } } }
    ]);
    const examWise = { JEE: 0, NEET: 0, KCET: 0, Board: 0 };
    examStats.forEach(stat => {
      if (stat._id) examWise[stat._id] = stat.count;
    });

    // 4. Count by Subject (with Subject name populate)
    const subjectStats = await Question.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subjectDetails'
        }
      },
      { $unwind: '$subjectDetails' },
      {
        $project: {
          _id: 1,
          name: '$subjectDetails.name',
          classNum: '$subjectDetails.classNum',
          count: 1
        }
      }
    ]);

    // 5. Total pending image slots
    const pendingSlots = await Question.aggregate([
      { $unwind: '$imageSlots' },
      { $match: { 'imageSlots.url': null } },
      { $count: 'pending' }
    ]);
    const pendingImageCount = pendingSlots.length > 0 ? pendingSlots[0].pending : 0;

    // 6. Recent Uploads (past 10 questions)
    const recentUploads = await Question.find()
      .populate('subject', 'name')
      .sort({ createdDate: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      stats: {
        totalQuestions,
        difficulty,
        examWise,
        subjectStats,
        pendingImageCount,
        recentUploads: recentUploads.map(q => ({
          id: q._id,
          questionNumber: q.questionNumber,
          subject: q.subject?.name || 'Unknown',
          difficulty: q.difficulty,
          createdDate: q.createdDate
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
