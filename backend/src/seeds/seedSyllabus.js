const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Concept = require('../models/Concept');
const SubConcept = require('../models/SubConcept');
const ncertSyllabus = require('./ncertData');

const seedAll = async () => {
  try {
    // 1. Seed Admin User
    const adminEmail = process.env.ADMIN_EMAIL || 'manchestertechnologiess@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'MANTECH';
    
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.findOne({ email: adminEmail.toLowerCase() });
    }
    
    if (!admin) {
      // Password will be automatically hashed by the User pre-save hook
      await User.create({
        name: 'Manchester Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      console.log('Admin user account seeded successfully.');
    } else {
      admin.email = adminEmail;
      admin.password = adminPassword; // User pre-save hook will hash it automatically
      admin.role = 'admin';
      await admin.save();
      console.log('Admin user account credentials updated successfully.');
    }

    // 2. Check if syllabus data already exists
    const subjectCount = await Subject.countDocuments();
    if (subjectCount > 0) {
      console.log('Syllabus collections already contain data. Skipping syllabus seed.');
      return;
    }

    console.log('Syllabus collection is empty. Starting NCERT syllabus seeding...');
    
    for (const subInfo of ncertSyllabus) {
      // Create Subject
      const subject = await Subject.create({
        name: subInfo.subjectName,
        classNum: subInfo.classNum
      });
      
      console.log(`- Seeded Subject: ${subInfo.subjectName} (Class ${subInfo.classNum})`);
      
      for (const chapInfo of subInfo.chapters) {
        // Create Chapter
        const chapter = await Chapter.create({
          name: chapInfo.name,
          subject: subject._id
        });
        
        for (const concInfo of chapInfo.concepts) {
          // Create Concept
          const concept = await Concept.create({
            name: concInfo.name,
            chapter: chapter._id
          });
          
          // Create SubConcepts mapping
          const subConceptsToInsert = concInfo.subConcepts.map(subName => ({
            name: subName,
            concept: concept._id
          }));
          
          await SubConcept.insertMany(subConceptsToInsert);
        }
      }
    }
    
    console.log('NCERT syllabus preloaded successfully!');
  } catch (error) {
    console.error('Seeding process failed:', error);
    throw error;
  }
};

// Execute if run directly from command line
if (require.main === module) {
  const dbConfig = require('../config/db');
  
  const runDirectly = async () => {
    try {
      console.log('Initializing database connection for seeding...');
      const conn = await dbConfig();
      if (!conn) {
        console.error('Could not connect to database. Make sure MONGODB_URI is configured.');
        process.exit(1);
      }
      await seedAll();
      console.log('Seeding transaction complete. Closing connection.');
      await mongoose.connection.close();
      process.exit(0);
    } catch (err) {
      console.error('Direct seed execution error:', err);
      process.exit(1);
    }
  };
  
  runDirectly();
}

module.exports = seedAll;
