const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connString = process.env.MONGODB_URI;
    if (!connString) {
      console.warn('WARNING: MONGODB_URI is not defined in the environment variables. Database connection skipped.');
      return null;
    }
    
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(connString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    // Return null instead of crashing the process so other parts (like local upload routing) can be tested
    return null;
  }
};

module.exports = connectDB;
