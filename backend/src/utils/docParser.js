const WordExtractor = require('word-extractor');
const { parseTextToQuestions } = require('./textParser');

/**
 * Extracts questions from a legacy .doc file buffer
 * @param {Buffer} buffer - File buffer
 * @returns {Promise<Array>} List of parsed question objects
 */
const parseDoc = async (buffer) => {
  try {
    const extractor = new WordExtractor();
    const doc = await extractor.extract(buffer);
    const text = doc.getBody() || '';
    return parseTextToQuestions(text);
  } catch (error) {
    console.error('Error parsing legacy DOC:', error);
    throw new Error('Failed to parse legacy .doc file: ' + error.message);
  }
};

module.exports = {
  parseDoc
};
