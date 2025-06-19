const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Remove deprecated options
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔒 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log(`
🔧 MongoDB Connection Troubleshooting:
1. Make sure MongoDB is installed and running
2. Check if MongoDB service is started:
   - Windows: net start MongoDB
   - macOS: brew services start mongodb-community
   - Linux: sudo systemctl start mongod
3. Verify connection string: ${process.env.MONGODB_URI}
4. Check if port 27017 is available
5. For MongoDB Atlas, ensure IP is whitelisted

💡 You can also use MongoDB Atlas (cloud) by updating MONGODB_URI in .env file
    `);
    
    // Don't exit in development, allow server to start without DB
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('⚠️  Starting server without database connection (development mode)');
    }
  }
};

module.exports = connectDB;