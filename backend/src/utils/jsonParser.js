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
      
      // Initialize imageSlots
      let imageSlots = [];
      if (Array.isArray(item.imageSlots)) {
        // Use predefined slots if they exist
        imageSlots = item.imageSlots.map(slot => ({
          slotId: slot.slotId,
          url: slot.url || null
        }));
      } else {
        // Auto-generate slot placeholders by scanning text
        const registerSlots = (sourceText, prefix) => {
          if (!sourceText) return;
          const matches = sourceText.match(/\[\[IMG_SLOT\]\]/g);
          const count = matches ? matches.length : 0;
          for (let s = 0; s < count; s++) {
            imageSlots.push({
              slotId: `${prefix}_${s}`,
              url: null
            });
          }
        };
        registerSlots(questionText, 'questionText');
        registerSlots(optA, 'optionA');
        registerSlots(optB, 'optionB');
        registerSlots(optC, 'optionC');
        registerSlots(optD, 'optionD');
        registerSlots(explanation, 'explanation');
      }
      
      validatedQuestions.push({
        questionNumber: qNum,
        questionText,
        options: {
          A: { text: optA, image: (typeof item.options?.A === 'object') ? (item.options.A.image || null) : null },
          B: { text: optB, image: (typeof item.options?.B === 'object') ? (item.options.B.image || null) : null },
          C: { text: optC, image: (typeof item.options?.C === 'object') ? (item.options.C.image || null) : null },
          D: { text: optD, image: (typeof item.options?.D === 'object') ? (item.options.D.image || null) : null }
        },
        correctAnswer,
        explanation,
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
