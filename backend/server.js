const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const seedAll = require('./src/seeds/seedSyllabus');

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for frontend integration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  // Add your Vercel frontend URL below after deploying:
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: Origin '${origin}' not allowed`));
  },
  credentials: true,
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (essential local fallback for image slots)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routers
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/syllabus', require('./src/routes/syllabus'));
app.use('/api/questions', require('./src/routes/questions'));

// Welcome/Health endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Manchester Technologies Question Bank API is running.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server & Connect Database
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Establish Database Connection (graceful if connection string is missing)
    const conn = await connectDB();
    
    if (conn) {
      // 2. Run Self-Seeding (preloads admin credentials and NCERT Class 11 & 12 syllabus automatically)
      try {
        await seedAll();
      } catch (seedErr) {
        console.error('Self-seeding during startup failed:', seedErr.message);
      }
    } else {
      console.warn('NOTE: Database connection skipped. Awaiting MONGODB_URI configuration in .env');
    }

    // 3. Start Listening
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to initialize server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
