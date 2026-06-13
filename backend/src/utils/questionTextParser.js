/**
 * Smart Question Text Parser
 * Parses raw pasted question text and extracts structured question fields.
 * Supports formats from NCERT, JEE, NEET, CBSE textbooks, PDFs, and Word docs.
 */

/**
 * Detect question type from parsed content
 */
const detectQuestionType = (text, options, correctAnswer) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('assertion') && lowerText.includes('reason')) {
    return 'Assertion-Reason';
  }
  if (lowerText.includes('match the following') || lowerText.includes('match column') || 
      lowerText.includes('list i') || lowerText.includes('list-i')) {
    return 'Match-Following';
  }
  if (lowerText.includes('case study') || lowerText.includes('read the following passage') ||
      lowerText.includes('based on the following')) {
    return 'Case-Study';
  }
  if (correctAnswer && correctAnswer.includes(',')) {
    return 'Multiple-Correct';
  }
  // Numerical: answer is a number
  if (correctAnswer && /^\d+(\.\d+)?$/.test(correctAnswer.trim())) {
    return 'Numerical';
  }
  // If no options detected
  if (!options || (!options.A && !options.B && !options.C && !options.D)) {
    return 'Descriptive';
  }
  return 'MCQ';
};

/**
 * Clean and normalize extracted text
 */
const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/  +/g, ' ')
    .trim();
};

/**
 * Parse a single question block from text
 */
const parseSingleQuestion = (rawText) => {
  const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  
  const result = {
    questionText: '',
    options: { A: '', B: '', C: '', D: '' },
    correctAnswer: '',
    explanation: '',
    questionType: 'MCQ',
  };

  // ─── Extract Options ──────────────────────────────────────────────────────
  // Matches: A) A. (A) A: Option A: a) a. (a)
  const optionPatterns = [
    /(?:^|\n)\s*\(?([ABCDabcd])\)\.?\s*(.+?)(?=\n\s*\(?[ABCDabcd]\)|\n\s*(?:Ans(?:wer)?|Correct(?:\s+Ans(?:wer)?)?|Key|Sol(?:ution)?|Exp(?:lanation)?)\s*[:.-]|$)/gs,
    /(?:^|\n)\s*([ABCDabcd])[\.\:]\s*(.+?)(?=\n\s*[ABCDabcd][\.\:]|\n\s*(?:Ans(?:wer)?|Correct|Key|Sol|Exp)\s*[:.-]|$)/gs,
    /(?:^|\n)\s*Option\s+([ABCDabcd])\s*[:.-]\s*(.+?)(?=\n\s*Option\s+[ABCDabcd]|\n\s*(?:Ans|Correct|Key|Sol|Exp)\s*[:.-]|$)/gis,
  ];

  let optionsExtracted = false;
  for (const pattern of optionPatterns) {
    const optionMatches = [...text.matchAll(pattern)];
    if (optionMatches.length >= 2) {
      optionMatches.forEach(match => {
        const letter = match[1].toUpperCase();
        if (['A', 'B', 'C', 'D'].includes(letter)) {
          result.options[letter] = cleanText(match[2]);
        }
      });
      optionsExtracted = true;
      break;
    }
  }

  // ─── Extract Answer ──────────────────────────────────────────────────────
  const answerPatterns = [
    /(?:^|\n)\s*(?:Answer|Ans(?:wer)?|Correct(?:\s+(?:Answer|Option|Ans))?|Key)\s*[:.-]\s*([^\n]+)/im,
    /(?:^|\n)\s*(?:Correct\s+Answer\s*(?:is)?)\s*[:.-]?\s*\(?([ABCDabcd\d\.]+)\)?/im,
    /(?:^|\n)\s*\(([ABCDabcd])\)\s+is\s+(?:correct|right)/im,
  ];
  
  for (const pattern of answerPatterns) {
    const match = text.match(pattern);
    if (match) {
      let ans = cleanText(match[1]);
      // Normalize: extract just the letter if it has extra text
      const letterMatch = ans.match(/^[(\s]*([ABCDabcd])[)\s.,]?/);
      if (letterMatch) {
        result.correctAnswer = letterMatch[1].toUpperCase();
      } else {
        result.correctAnswer = ans;
      }
      break;
    }
  }

  // ─── Extract Explanation ─────────────────────────────────────────────────
  const explanationPatterns = [
    /(?:^|\n)\s*(?:Solution|Explanation|Hint|Rationale|Reasoning|Justification)\s*[:.-]\s*([\s\S]+?)(?=\n\s*(?:Q\.|Q\d|Question|\d+\.)\s|$)/im,
    /(?:^|\n)\s*(?:Sol\.|Exp\.)\s*[:.-]\s*([\s\S]+?)(?=\n\s*(?:Q\.|Q\d|Question|\d+\.)\s|$)/im,
  ];
  
  for (const pattern of explanationPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.explanation = cleanText(match[1]);
      break;
    }
  }

  // ─── Extract Question Text ───────────────────────────────────────────────
  // Remove the parts already identified (options, answer, explanation)
  let qText = text;
  
  // Remove question number prefix: Q. Q1. 1. 1) (1) etc.
  qText = qText.replace(/^\s*(?:Q\.?\s*\d*\.?\s*|Q\d+[\.\)]\s*|\d+[\.\)]\s*)/i, '');
  
  // Find where options start and cut there
  const optionStartPatterns = [
    /\n\s*\(?[ABCDabcd]\)\.?\s+\S/,
    /\n\s*[ABCDabcd][\.\:]\s+\S/,
    /\n\s*Option\s+[ABCDabcd]\s*[:.-]/i,
  ];
  
  let optionStart = qText.length;
  for (const pat of optionStartPatterns) {
    const m = qText.search(pat);
    if (m !== -1 && m < optionStart) optionStart = m;
  }
  
  // Find where answer/explanation starts and cut there too
  const ansExpStart = qText.search(/\n\s*(?:Answer|Ans|Correct|Key|Solution|Explanation|Hint|Sol\.|Exp\.)\s*[:.-]/im);
  if (ansExpStart !== -1 && ansExpStart < optionStart) optionStart = ansExpStart;
  
  qText = qText.substring(0, optionStart).trim();
  
  // Remove trailing "Answer:" lines from question text
  qText = qText.replace(/\n\s*(?:Answer|Ans|Correct|Key)\s*[:.-][^\n]*/gim, '').trim();
  
  result.questionText = cleanText(qText);
  
  // ─── Detect Type ─────────────────────────────────────────────────────────
  result.questionType = detectQuestionType(result.questionText, result.options, result.correctAnswer);

  return result;
};

/**
 * Split raw text containing multiple questions into individual question blocks
 */
const splitIntoQuestions = (rawText) => {
  const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Split on question number patterns
  const splitPatterns = [
    /(?=\n\s*Q\.?\s*\d+[\.\)]\s)/i,   // Q.1. Q1) Q. 1
    /(?=\n\s*Question\s+\d+\s*[:.-])/i, // Question 1:
    /(?=\n\s*\d{1,3}[\.\)]\s+[A-Z])/,  // 1. Capital letter start
  ];
  
  for (const pattern of splitPatterns) {
    const parts = text.split(pattern).filter(p => p.trim().length > 20);
    if (parts.length > 1) return parts;
  }
  
  // Single question
  return [text];
};

/**
 * Main export: parse raw pasted text into one or multiple question objects
 */
const parseRawQuestionText = (rawText) => {
  if (!rawText || !rawText.trim()) {
    return { success: false, error: 'No text provided', questions: [] };
  }
  
  const blocks = splitIntoQuestions(rawText);
  const questions = blocks.map(block => parseSingleQuestion(block)).filter(q => q.questionText.length > 5);
  
  return {
    success: true,
    count: questions.length,
    questions,
  };
};

module.exports = { parseRawQuestionText, parseSingleQuestion };
