/**
 * One-time migration script: make difficulty optional for existing questions.
 * Existing questions KEEP their current difficulty values.
 * Run once: node src/seeds/migrateDifficulty.js
 */

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');

const migrate = async () => {
  try {
    await connectDB();
    console.log('Connected to database. Starting migration...');

    // Only need to update any questions that might have difficulty missing entirely
    // (not null, but the field absent). With the new schema default null, this is safe.
    const result = await mongoose.connection.db.collection('questions').updateMany(
      { difficulty: { $exists: false } },
      { $set: { difficulty: null } }
    );
    console.log(`Migration complete. Updated ${result.modifiedCount} questions without difficulty field.`);

    // Also ensure tags, topic, board, questionBank defaults are set
    const result2 = await mongoose.connection.db.collection('questions').updateMany(
      { tags: { $exists: false } },
      { $set: { tags: [], topic: '', board: '', questionBank: '' } }
    );
    console.log(`Set default fields on ${result2.modifiedCount} questions.`);

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
