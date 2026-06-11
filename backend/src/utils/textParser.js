/**
 * Parse raw text into structured question objects.
 * Handles split lines, patterns like "Question 1", "Q2:", "Q. 3", "4)",
 * options matching A), B), C), D) or A., B., C., D. and answer/explanation keys.
 * Detects [[IMG_SLOT]] occurrences and builds slot objects.
 */
const parseTextToQuestions = (text) => {
  if (!text) return [];

  // Normalize line breaks
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Split by question markers at the start of a line.
  // Matches e.g., "Question 12", "Q12.", "Q.12:", "Q 12)", "12."
  // Wait, let's make it robust: (?:^|\n)\s*(?:Question\s+|Q\.?\s*|Q\s+)?(\d+)[\s.:)]+
  // But if it's just a number, it could clash with option numbers or formulas.
  // So requiring a Q/Question prefix, or a number at start of line with a dot/parenthesis, is standard.
  // Let's support both prefix and plain numbers at the start of line:
  const questionRegex = /(?:^|\n)\s*(?:Question\s+|Q\.?\s*|Q\s+)(\d+)[\s.:)]+/gi;
  
  const matches = [];
  let match;
  
  // Reset regex index
  questionRegex.lastIndex = 0;
  
  while ((match = questionRegex.exec(normalized)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      qNum: parseInt(match[1], 10)
    });
  }

  const questions = [];
  
  for (let i = 0; i < matches.length; i++) {
    const startIdx = matches[i].index + matches[i].length;
    const endIdx = (i + 1 < matches.length) ? matches[i + 1].index : normalized.length;
    
    const body = normalized.substring(startIdx, endIdx).trim();
    if (!body) continue;

    // RegExes to extract options
    const optARegex = /(?:^|\n)\s*\(?A\)?[\s.:)]+([\s\S]*?)(?=(?:^|\n)\s*\(?B\)?[\s.:)]+|$)/i;
    const optBRegex = /(?:^|\n)\s*\(?B\)?[\s.:)]+([\s\S]*?)(?=(?:^|\n)\s*\(?C\)?[\s.:)]+|$)/i;
    const optCRegex = /(?:^|\n)\s*\(?C\)?[\s.:)]+([\s\S]*?)(?=(?:^|\n)\s*\(?D\)?[\s.:)]+|$)/i;
    const optDRegex = /(?:^|\n)\s*\(?D\)?[\s.:)]+([\s\S]*?)(?=(?:^|\n)\s*(?:Correct|Answer|Ans|Explanation|Exp|Detailed Explanation)[\s.:)]+|$)/i;

    const optAMatch = body.match(optARegex);
    const optBMatch = body.match(optBRegex);
    const optCMatch = body.match(optCRegex);
    const optDMatch = body.match(optDRegex);

    // Question Text (preceding option A)
    let questionText = body.split(/(?:^|\n)\s*\(?A\)?[\s.:)]+/i)[0] || '';
    questionText = questionText.trim();

    const optionA = optAMatch ? optAMatch[1].trim() : '';
    const optionB = optBMatch ? optBMatch[1].trim() : '';
    const optionC = optCMatch ? optCMatch[1].trim() : '';
    const optionD = optDMatch ? optDMatch[1].trim() : '';

    // Correct Answer (looks for Correct: A, Answer: A, Ans: A, etc.)
    const correctRegex = /(?:^|\n)\s*(?:Correct|Answer|Ans)[\s.:)]+\s*([A-D])/i;
    const correctMatch = body.match(correctRegex);
    const correctAnswer = correctMatch ? correctMatch[1].toUpperCase() : 'A';

    // Detailed Explanation (looks for Explanation:, Exp:, Detailed Explanation:)
    const expRegex = /(?:^|\n)\s*(?:Explanation|Exp|Detailed Explanation)[\s.:)]+([\s\S]*)$/i;
    const expMatch = body.match(expRegex);
    const explanation = expMatch ? expMatch[1].trim() : '';

    // Parse image slots for each text field
    const imageSlots = [];
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
    registerSlots(optionA, 'optionA');
    registerSlots(optionB, 'optionB');
    registerSlots(optionC, 'optionC');
    registerSlots(optionD, 'optionD');
    registerSlots(explanation, 'explanation');

    questions.push({
      questionNumber: matches[i].qNum,
      questionText,
      options: {
        A: { text: optionA, image: null },
        B: { text: optionB, image: null },
        C: { text: optionC, image: null },
        D: { text: optionD, image: null }
      },
      correctAnswer,
      explanation,
      imageSlots,
      difficulty: 'Easy', // Will be customized by the API caller or admin confirmation page
      examType: ['Board'], // Will be set by input forms
      classNum: 11, // Will be set by input forms
      marks: 4,
      negativeMarks: 1
    });
  }

  return questions;
};

module.exports = {
  parseTextToQuestions
};
