const mongoose = require('mongoose');

const SecurityEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  eventType: {
    type: String,
    required: true,
    // Types: DEVTOOLS_OPEN, CONTEXT_MENU_ATTEMPT, COPY_ATTEMPT, SCREENSHOT_KEY,
    // PRINT_ATTEMPT, TAB_BLUR, KEYBOARD_SHORTCUT_BLOCK, DRAG_IMAGE_ATTEMPT
    enum: [
      'DEVTOOLS_OPEN',
      'CONTEXT_MENU_ATTEMPT',
      'COPY_ATTEMPT',
      'SCREENSHOT_KEY',
      'PRINT_ATTEMPT',
      'TAB_BLUR',
      'KEYBOARD_SHORTCUT_BLOCK',
      'DRAG_IMAGE_ATTEMPT',
      'SUSPICIOUS_ACTIVITY'
    ]
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  ipAddress: {
    type: String,
    default: '',
  },
  userAgent: {
    type: String,
    default: '',
  },
  sessionId: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    default: '',
  },
  details: {
    type: String,
    default: '',
  }
});

SecurityEventSchema.index({ userId: 1, timestamp: -1 });
SecurityEventSchema.index({ eventType: 1 });

module.exports = mongoose.model('SecurityEvent', SecurityEventSchema);
