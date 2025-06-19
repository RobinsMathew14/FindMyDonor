const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import middleware
const { optionalAuth } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bloodRequestRoutes = require('./routes/bloodRequests');
const donationRoutes = require('./routes/donations');

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5000'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Optional authentication for public routes
app.use('/api/users/donors', optionalAuth);
app.use('/api/users/hospitals', optionalAuth);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blood-requests', bloodRequestRoutes);
app.use('/api/donations', donationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FindMyDonor API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'FindMyDonor API v1.0.0',
    documentation: {
      authentication: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        refreshToken: 'POST /api/auth/refresh-token',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password/:token',
        changePassword: 'PUT /api/auth/change-password',
        getProfile: 'GET /api/auth/me',
        verifyEmail: 'POST /api/auth/verify-email'
      },
      users: {
        getAllUsers: 'GET /api/users',
        getDonors: 'GET /api/users/donors',
        getHospitals: 'GET /api/users/hospitals',
        getUserById: 'GET /api/users/:id',
        updateUser: 'PUT /api/users/:id',
        deleteUser: 'DELETE /api/users/:id',
        reactivateUser: 'POST /api/users/:id/reactivate',
        getDonationHistory: 'GET /api/users/:id/donation-history',
        getDashboardStats: 'GET /api/users/stats/dashboard'
      },
      bloodRequests: {
        createRequest: 'POST /api/blood-requests',
        getAllRequests: 'GET /api/blood-requests',
        getRequestById: 'GET /api/blood-requests/:id',
        updateRequest: 'PUT /api/blood-requests/:id',
        deleteRequest: 'DELETE /api/blood-requests/:id',
        respondToRequest: 'POST /api/blood-requests/:id/respond',
        updateResponse: 'PUT /api/blood-requests/:id/responses/:donorId',
        getRequestStats: 'GET /api/blood-requests/stats/dashboard'
      },
      donations: {
        scheduleDonation: 'POST /api/donations',
        getAllDonations: 'GET /api/donations',
        getDonationById: 'GET /api/donations/:id',
        updateDonation: 'PUT /api/donations/:id',
        cancelDonation: 'POST /api/donations/:id/cancel',
        completeDonation: 'POST /api/donations/:id/complete',
        getDonationStats: 'GET /api/donations/stats/overview'
      }
    },
    features: [
      'User Authentication & Authorization',
      'Blood Donor Management',
      'Hospital Management',
      'Blood Request System',
      'Donation Tracking',
      'Blood Inventory Management',
      'Real-time Notifications',
      'Advanced Search & Filtering',
      'Dashboard Analytics',
      'Email Verification',
      'Password Reset',
      'Rate Limiting',
      'Data Validation',
      'Security Features'
    ]
  });
});

// Sample data endpoint for testing
app.get('/api/sample-data', (req, res) => {
  res.json({
    success: true,
    data: {
      bloodGroups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      bloodComponents: ['whole_blood', 'red_cells', 'platelets', 'plasma', 'cryoprecipitate'],
      urgencyLevels: ['critical', 'urgent', 'normal'],
      userTypes: ['donor', 'hospital', 'admin'],
      donationTypes: ['voluntary', 'replacement', 'directed', 'autologous'],
      genders: ['male', 'female', 'other'],
      hospitalTypes: ['government', 'private', 'charitable', 'corporate'],
      states: [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
        'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep',
        'Andaman and Nicobar Islands'
      ]
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: {
      health: 'GET /api/health',
      documentation: 'GET /api',
      authentication: '/api/auth/*',
      users: '/api/users/*'
    }
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
🩸 FindMyDonor API Server Started Successfully!
🚀 Server running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📚 API Documentation: http://localhost:${PORT}/api
❤️  Health Check: http://localhost:${PORT}/api/health
🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}
⏰ Started at: ${new Date().toISOString()}
  `);
});

module.exports = app;