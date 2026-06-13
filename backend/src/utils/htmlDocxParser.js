const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

/**
 * Saves base64 encoded image to a temporary file in the uploads directory
 * @param {string} dataUri - base64 data URI
 * @returns {string|null} Relative URL of saved file
 */
/**
 * Saves base64 encoded image to a temporary file in the uploads directory or uploads to Cloudinary.
 * If running on Vercel and Cloudinary is missing, returns the base64 URI itself as a fallback.
 * @param {string} dataUri - base64 data URI
 * @returns {Promise<string|null>} Relative URL or secure URL of saved/uploaded file
 */
const saveBase64Image = async (dataUri) => {
  if (!dataUri || !dataUri.startsWith('data:')) {
    return null;
  }
  
  // 1. Try Cloudinary if configured
  const isCloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (isCloudinaryConfigured) {
    try {
      const cloudinaryInstance = require('../config/cloudinary');
      const result = await cloudinaryInstance.uploader.upload(dataUri, { folder: 'manchester_questions' });
      return result.secure_url;
    } catch (err) {
      console.error('Cloudinary upload from base64 failed:', err);
    }
  }

  // 2. If Vercel (or any read-only/serverless env) and no Cloudinary, return the dataUri itself (base64 string)
  if (process.env.VERCEL) {
    return dataUri;
  }
  
  // 3. Local fallback (disk storage) for local dev without Cloudinary
  try {
    const parts = dataUri.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const extension = mime.split('/')[1] || 'png';
    const base64Data = parts[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const fileName = `temp_import_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);
    
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error('Error saving base64 image locally, returning dataUri as fallback:', error);
    return dataUri; // Final fallback
  }
};

/**
 * Helper to strip other HTML tags and clean up plain text
 */
const cleanHtmlText = (html) => {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, '') // remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // collapse duplicate whitespaces
    .trim();
};

/**
 * Parses DOCX buffer into structured questions with sequential image mapping
 * @param {Buffer} buffer - File buffer
 * @returns {Promise<Array>} List of parsed question objects
 */
const parseDocx = async (buffer) => {
  try {
    const result = await mammoth.convertToHtml({ buffer });
    const html = result.value || '';
    
    const images = [];
    let imgIndex = 0;
    
    // Replace all images in HTML with custom markers and store the base64 content
    let modifiedHtml = html.replace(/<img[^>]+src="([^"]+)"[^>]*>/gi, (match, src) => {
      images.push(src);
      const marker = `[[TEMP_IMAGE_MARKER_${imgIndex}]]`;
      imgIndex++;
      return marker;
    });

    // Extract blocks (paragraphs, list items, table rows)
    const blockRegex = /<p>([\s\S]*?)<\/p>|<li>([\s\S]*?)<\/li>|<tr>([\s\S]*?)<\/tr>/gi;
    let blockMatch;
    const blocks = [];
    
    while ((blockMatch = blockRegex.exec(modifiedHtml)) !== null) {
      const rawContent = blockMatch[1] || blockMatch[2] || blockMatch[3] || '';
      const clean = cleanHtmlText(rawContent);
      if (clean) {
        blocks.push(clean);
      }
    }

    const questions = [];
    let currentQuestion = null;
    let currentContext = 'questionText'; // 'questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'explanation'

    const isQuestionStart = (text) => {
      return /^\s*(?:Question\s+|Q\.?\s*|Q\s+)(\d+)[\s.:)]+/i.test(text) || /^\s*(\d+)[\s.:)]+/i.test(text);
    };
    
    const getQuestionNumber = (text, defaultNum) => {
      const match = text.match(/^\s*(?:Question\s+|Q\.?\s*|Q\s+)?(\d+)[\s.:)]+/i);
      return match ? parseInt(match[1], 10) : defaultNum;
    };

    const processTextPart = (part) => {
      if (!part.trim()) return;
      
      const optAMatch = part.match(/^\s*\(?A\)?[\s.:)]+(.*)/i);
      const optBMatch = part.match(/^\s*\(?B\)?[\s.:)]+(.*)/i);
      const optCMatch = part.match(/^\s*\(?C\)?[\s.:)]+(.*)/i);
      const optDMatch = part.match(/^\s*\(?D\)?[\s.:)]+(.*)/i);
      const correctMatch = part.match(/^\s*(?:Correct|Answer|Ans)[\s.:)]+\s*([A-D])/i);
      const expMatch = part.match(/^\s*(?:Explanation|Exp|Detailed Explanation)[\s.:)]+(.*)/i);
      
      if (optAMatch) {
        currentContext = 'optionA';
        currentQuestion.options.A.text = optAMatch[1].trim();
      } else if (optBMatch) {
        currentContext = 'optionB';
        currentQuestion.options.B.text = optBMatch[1].trim();
      } else if (optCMatch) {
        currentContext = 'optionC';
        currentQuestion.options.C.text = optCMatch[1].trim();
      } else if (optDMatch) {
        currentContext = 'optionD';
        currentQuestion.options.D.text = optDMatch[1].trim();
      } else if (correctMatch) {
        currentQuestion.correctAnswer = correctMatch[1].toUpperCase();
      } else if (expMatch) {
        currentContext = 'explanation';
        currentQuestion.explanation = expMatch[1].trim();
      } else {
        // Append to current context
        if (currentContext === 'questionText') {
          currentQuestion.questionText += (currentQuestion.questionText ? ' ' : '') + part.trim();
        } else if (currentContext === 'optionA') {
          currentQuestion.options.A.text += (currentQuestion.options.A.text ? ' ' : '') + part.trim();
        } else if (currentContext === 'optionB') {
          currentQuestion.options.B.text += (currentQuestion.options.B.text ? ' ' : '') + part.trim();
        } else if (currentContext === 'optionC') {
          currentQuestion.options.C.text += (currentQuestion.options.C.text ? ' ' : '') + part.trim();
        } else if (currentContext === 'optionD') {
          currentQuestion.options.D.text += (currentQuestion.options.D.text ? ' ' : '') + part.trim();
        } else if (currentContext === 'explanation') {
          currentQuestion.explanation += (currentQuestion.explanation ? ' ' : '') + part.trim();
        }
      }
    };

    for (let b = 0; b < blocks.length; b++) {
      const block = blocks[b];
      
      if (isQuestionStart(block)) {
        // Save current question
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        
        // Start new question
        const qNum = getQuestionNumber(block, questions.length + 1);
        const textWithoutQNum = block.replace(/^\s*(?:Question\s+|Q\.?\s*|Q\s+)?(\d+)[\s.:)]+/i, '').trim();
        
        currentQuestion = {
          questionNumber: qNum,
          title: `Question ${qNum}`,
          questionType: 'MCQ',
          questionText: '',
          options: {
            A: { text: '', image: null },
            B: { text: '', image: null },
            C: { text: '', image: null },
            D: { text: '', image: null }
          },
          correctAnswer: 'A',
          explanation: '',
          questionImage: null,
          optionAImage: null,
          optionBImage: null,
          optionCImage: null,
          optionDImage: null,
          solutionImage: null,
          imageSlots: [],
          examType: ['Board'],
          difficulty: 'Easy',
          classNum: 11,
          marks: 4,
          negativeMarks: 1
        };
        
        currentContext = 'questionText';
        
        if (textWithoutQNum) {
          const parts = textWithoutQNum.split(/(\[\[TEMP_IMAGE_MARKER_\d+\]\])/g);
          for (const part of parts) {
            const imgMatch = part.match(/\[\[TEMP_IMAGE_MARKER_(\d+)\]\]/);
            if (imgMatch) {
              const idx = parseInt(imgMatch[1], 10);
              const src = images[idx];
              const imageUrl = await saveBase64Image(src);
              
              currentQuestion.questionImage = imageUrl;
              currentQuestion.questionText += (currentQuestion.questionText ? ' ' : '') + '[QUESTION_IMAGE_SLOT]';
            } else {
              processTextPart(part);
            }
          }
        }
      } else if (currentQuestion) {
        // Process block elements
        const parts = block.split(/(\[\[TEMP_IMAGE_MARKER_\d+\]\])/g);
        for (const part of parts) {
          const imgMatch = part.match(/\[\[TEMP_IMAGE_MARKER_(\d+)\]\]/);
          if (imgMatch) {
            const idx = parseInt(imgMatch[1], 10);
            const src = images[idx];
            const imageUrl = await saveBase64Image(src);
            
            if (currentContext === 'questionText') {
              currentQuestion.questionImage = imageUrl;
              currentQuestion.questionText += (currentQuestion.questionText ? ' ' : '') + '[QUESTION_IMAGE_SLOT]';
            } else if (currentContext === 'optionA') {
              currentQuestion.optionAImage = imageUrl;
              currentQuestion.options.A.text += (currentQuestion.options.A.text ? ' ' : '') + '[OPTION_A_IMAGE_SLOT]';
            } else if (currentContext === 'optionB') {
              currentQuestion.optionBImage = imageUrl;
              currentQuestion.options.B.text += (currentQuestion.options.B.text ? ' ' : '') + '[OPTION_B_IMAGE_SLOT]';
            } else if (currentContext === 'optionC') {
              currentQuestion.optionCImage = imageUrl;
              currentQuestion.options.C.text += (currentQuestion.options.C.text ? ' ' : '') + '[OPTION_C_IMAGE_SLOT]';
            } else if (currentContext === 'optionD') {
              currentQuestion.optionDImage = imageUrl;
              currentQuestion.options.D.text += (currentQuestion.options.D.text ? ' ' : '') + '[OPTION_D_IMAGE_SLOT]';
            } else if (currentContext === 'explanation') {
              currentQuestion.solutionImage = imageUrl;
              currentQuestion.explanation += (currentQuestion.explanation ? ' ' : '') + '[SOLUTION_IMAGE_SLOT]';
            }
          } else {
            processTextPart(part);
          }
        }
      }
    }

    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    // Map separate image fields to imageSlots list for backward compatibility
    questions.forEach(q => {
      const slots = [];
      if (q.questionImage) slots.push({ slotId: 'questionText_0', url: q.questionImage });
      if (q.optionAImage) {
        slots.push({ slotId: 'optionA_0', url: q.optionAImage });
        q.options.A.image = q.optionAImage;
      }
      if (q.optionBImage) {
        slots.push({ slotId: 'optionB_0', url: q.optionBImage });
        q.options.B.image = q.optionBImage;
      }
      if (q.optionCImage) {
        slots.push({ slotId: 'optionC_0', url: q.optionCImage });
        q.options.C.image = q.optionCImage;
      }
      if (q.optionDImage) {
        slots.push({ slotId: 'optionD_0', url: q.optionDImage });
        q.options.D.image = q.optionDImage;
      }
      if (q.solutionImage) slots.push({ slotId: 'explanation_0', url: q.solutionImage });
      
      q.imageSlots = slots;
    });

    return questions;
  } catch (error) {
    console.error('HTML Word Import Parsing Error:', error);
    throw new Error('Failed to parse .docx file: ' + error.message);
  }
};

module.exports = {
  parseDocx
};
