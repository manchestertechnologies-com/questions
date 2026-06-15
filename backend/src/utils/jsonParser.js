/**
 * Parse and validate JSON buffer containing question objects.
 * Normalizes input structures and scans for [[IMG_SLOT]] elements if needed.
 */
const parseJsonQuestions = (buffer) => {
  try {
    const rawData = buffer.toString('utf-8');
    const parsed = JSON.parse(rawData);
    
    // Support either a single question object or an array of questions
    const items = Array.isArray(parsed) ? parsed : [parsed];
    const validatedQuestions = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const qNum = typeof item.questionNumber === 'number' ? item.questionNumber : (i + 1);
      const questionText = item.questionText || '';
      
      if (!questionText) {
        throw new Error(`Question entry at index ${i} is missing 'questionText'.`);
      }
      
      // Handle either structured options or simple text options
      const optA = (typeof item.options?.A === 'object') ? (item.options.A.text || '') : (item.options?.A || '');
      const optB = (typeof item.options?.B === 'object') ? (item.options.B.text || '') : (item.options?.B || '');
      const optC = (typeof item.options?.C === 'object') ? (item.options.C.text || '') : (item.options?.C || '');
      const optD = (typeof item.options?.D === 'object') ? (item.options.D.text || '') : (item.options?.D || '');
      
      const correctAnswer = String(item.correctAnswer || 'A').toUpperCase().trim();
      if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
        throw new Error(`Question ${qNum} contains invalid correctAnswer '${correctAnswer}'. Must be A, B, C, or D.`);
      }
      
      const explanation = item.explanation || '';
      
      // Extract legacy image properties
      const optAImage = (typeof item.options?.A === 'object') ? (item.options.A.image || null) : (item.optionAImage || null);
      const optBImage = (typeof item.options?.B === 'object') ? (item.options.B.image || null) : (item.optionBImage || null);
      const optCImage = (typeof item.options?.C === 'object') ? (item.options.C.image || null) : (item.optionCImage || null);
      const optDImage = (typeof item.options?.D === 'object') ? (item.options.D.image || null) : (item.optionDImage || null);
      const questionImage = item.questionImage || null;
      const solutionImage = item.solutionImage || item.explanationImage || null;

      // Scan and initialize imageSlots from placeholders
      let imageSlots = [];
      const registerSlots = (sourceText, prefix) => {
        if (!sourceText) return;
        const matches = sourceText.match(/\[\[(?:IMG|IMAGE)[ _]SLOT\]\]/gi);
        const count = matches ? matches.length : 0;
        for (let s = 0; s < count; s++) {
          const slotId = `${prefix}_${s}`;
          // Check if it already exists in item.imageSlots
          const existingSlot = Array.isArray(item.imageSlots) ? item.imageSlots.find(sl => sl.slotId === slotId) : null;
          imageSlots.push({
            slotId,
            url: existingSlot ? (existingSlot.url || null) : null
          });
        }
      };
      
      registerSlots(questionText, 'questionText');
      registerSlots(optA, 'optionA');
      registerSlots(optB, 'optionB');
      registerSlots(optC, 'optionC');
      registerSlots(optD, 'optionD');
      registerSlots(explanation, 'explanation');

      // Also copy any other pre-defined slots that didn't match standard text scanning
      if (Array.isArray(item.imageSlots)) {
        item.imageSlots.forEach(slot => {
          if (!imageSlots.some(s => s.slotId === slot.slotId)) {
            imageSlots.push({
              slotId: slot.slotId,
              url: slot.url || null
            });
          }
        });
      }

      // Sync legacy image fields with slot URLs if slot doesn't have a URL set yet
      imageSlots.forEach(s => {
        if (s.slotId === 'questionText_0' && !s.url) s.url = questionImage;
        if (s.slotId === 'optionA_0' && !s.url) s.url = optAImage;
        if (s.slotId === 'optionB_0' && !s.url) s.url = optBImage;
        if (s.slotId === 'optionC_0' && !s.url) s.url = optCImage;
        if (s.slotId === 'optionD_0' && !s.url) s.url = optDImage;
        if (s.slotId === 'explanation_0' && !s.url) s.url = solutionImage;
      });

      validatedQuestions.push({
        questionNumber: qNum,
        title: item.title || `Question ${qNum}`,
        questionType: item.questionType || 'MCQ',
        questionText,
        options: {
          A: { text: optA, image: optAImage },
          B: { text: optB, image: optBImage },
          C: { text: optC, image: optCImage },
          D: { text: optD, image: optDImage }
        },
        correctAnswer,
        explanation,
        questionImage,
        optionAImage: optAImage,
        optionBImage: optBImage,
        optionCImage: optCImage,
        optionDImage: optDImage,
        solutionImage,
        imageSlots,
        difficulty: item.difficulty || 'Easy',
        examType: Array.isArray(item.examType) ? item.examType : [item.examType || 'Board'],
        classNum: item.classNum || 11,
        marks: typeof item.marks === 'number' ? item.marks : 4,
        negativeMarks: typeof item.negativeMarks === 'number' ? item.negativeMarks : 1
      });
    }
    
    return validatedQuestions;
  } catch (error) {
    console.error('Error validating JSON data:', error);
    throw new Error('Failed to parse question data JSON: ' + error.message);
  }
};

module.exports = {
  parseJsonQuestions
};
