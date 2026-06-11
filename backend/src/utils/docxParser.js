const mammoth = require('mammoth');
const { parseTextToQuestions } = require('./textParser');

/**
 * Extracts questions from a .docx file buffer
 * @param {Buffer} buffer - File buffer
 * @returns {Promise<Array>} List of parsed question objects
 */
const parseDocx = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value || '';
    return parseTextToQuestions(text);
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse .docx file: ' + error.message);
  }
};

module.exports = {
  parseDocx
};
