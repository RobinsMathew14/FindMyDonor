# 🩸 FindMyDonor - Blood Donation Management System

A comprehensive MERN stack application for managing blood donations, connecting donors with hospitals, and maintaining blood inventory.

## 🌟 Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** with refresh tokens
- **Role-based Access Control** (Donor, Hospital, Admin)
- **Email Verification** and password reset
- **Account Security** with login attempt limiting
- **Multi-language Support** (10+ regional languages)

### 👥 User Management
- **Donor Registration** with comprehensive health screening
- **Hospital/Blood Bank Registration** with verification
- **Profile Management** with privacy settings
- **Advanced Search & Filtering** by location, blood group, etc.

### 🩸 Blood Management
- **Blood Request System** with urgency levels
- **Real-time Blood Inventory** tracking
- **Donation Scheduling** and management
- **Blood Compatibility** matching
- **Expiry Tracking** and alerts

### 📊 Analytics & Reporting
- **Dashboard Analytics** for admins
- **Donation Statistics** and trends
- **Inventory Reports** and low stock alerts
- **User Activity** monitoring

### 🔔 Notifications
- **Email Notifications** for important events
- **Real-time Alerts** for urgent requests
- **SMS Integration** ready
- **Push Notifications** support

### 🛡️ Security Features
- **Data Encryption** and secure storage
- **Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **CORS Protection** and security headers
- **Audit Logging** for sensitive operations

## 🚀 Technology Stack

### Frontend
- **React 18** with Hooks and Context API
- **React Router** for navigation
- **CSS3** with modern animations
- **Responsive Design** for all devices
- **Progressive Web App** features

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **Helmet** for security headers
- **Rate Limiting** middleware

### Development Tools
- **Vite** for fast development
- **Nodemon** for auto-restart
- **ESLint** for code quality
- **Git** for version control

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher)
- **Git**
- **npm** or **yarn**

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/findmydonor.git
cd findmydonor
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd BackEnd
npm install
```

#### Environment Configuration
Create a `.env` file in the BackEnd directory:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/findmydonor
DB_NAME=findmydonor

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_here
JWT_REFRESH_EXPIRE=7d

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=FindMyDonor <noreply@findmydonor.com>

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads/

# Frontend URL
FRONTEND_URL=http://localhost:5173

# API Configuration
API_VERSION=v1
```

#### Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On Windows (if MongoDB is installed as a service)
net start MongoDB

# On macOS (using Homebrew)
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

#### Start Backend Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../FrontEnd
npm install
```

#### Start Frontend Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔧 Configuration

### MongoDB Setup
1. **Install MongoDB** from [official website](https://www.mongodb.com/try/download/community)
2. **Create Database**: The application will automatically create the database and collections
3. **Indexes**: The application will create necessary indexes automatically

### Email Configuration (Optional)
For email notifications to work:
1. **Gmail Setup**: Enable 2-factor authentication and create an app password
2. **SMTP Settings**: Update the email configuration in `.env`
3. **Email Templates**: Customize email templates in the backend

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     - Register new user
POST /api/auth/login        - Login user
POST /api/auth/logout       - Logout user
GET  /api/auth/me          - Get current user
PUT  /api/auth/change-password - Change password
POST /api/auth/forgot-password - Request password reset
POST /api/auth/reset-password/:token - Reset password
```

### User Management
```
GET  /api/users            - Get all users (with filters)
GET  /api/users/donors     - Get available donors
GET  /api/users/hospitals  - Get hospitals/blood banks
GET  /api/users/:id        - Get user by ID
PUT  /api/users/:id        - Update user profile
DELETE /api/users/:id      - Deactivate user account
```

### Blood Requests
```
POST /api/blood-requests   - Create blood request
GET  /api/blood-requests   - Get blood requests
GET  /api/blood-requests/:id - Get request by ID
PUT  /api/blood-requests/:id - Update request
POST /api/blood-requests/:id/respond - Respond to request
```

### Blood Inventory
```
GET  /api/blood-inventory  - Get inventory
PUT  /api/blood-inventory/:id - Update inventory
POST /api/blood-inventory/:id/add-units - Add blood units
POST /api/blood-inventory/:id/reserve - Reserve units
```

### Donations
```
POST /api/donations        - Schedule donation
GET  /api/donations        - Get donations
GET  /api/donations/:id    - Get donation by ID
PUT  /api/donations/:id    - Update donation
POST /api/donations/:id/complete - Complete donation
```

## 🧪 Testing

### Backend Testing
```bash
cd BackEnd
npm test
```

### Frontend Testing
```bash
cd FrontEnd
npm test
```

### API Testing
Use the provided Postman collection or test endpoints manually:
```bash
# Health check
curl http://localhost:5000/api/health

# API documentation
curl http://localhost:5000/api
```

## 🚀 Deployment

### Backend Deployment (Heroku)
1. **Create Heroku App**
```bash
heroku create findmydonor-api
```

2. **Set Environment Variables**
```bash
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_production_jwt_secret
# ... set other environment variables
```

3. **Deploy**
```bash
git subtree push --prefix BackEnd heroku main
```

### Frontend Deployment (Netlify/Vercel)
1. **Build the application**
```bash
cd FrontEnd
npm run build
```

2. **Deploy to Netlify**
- Connect your GitHub repository
- Set build command: `npm run build`
- Set publish directory: `dist`

### Database Deployment (MongoDB Atlas)
1. **Create MongoDB Atlas Account**
2. **Create Cluster** and get connection string
3. **Update Environment Variables** with Atlas URI

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to branch** (`git push origin feature/AmazingFeature`)
5. **Open Pull Request**

### Development Guidelines
- Follow **ESLint** rules
- Write **meaningful commit messages**
- Add **tests** for new features
- Update **documentation** as needed
- Follow **security best practices**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

#### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# Restart MongoDB service
sudo systemctl restart mongod
```

#### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

#### CORS Issues
- Ensure `FRONTEND_URL` is correctly set in backend `.env`
- Check that frontend is running on the specified URL

### Getting Help
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check API documentation at `/api`
- **Email**: Contact support team

## 🙏 Acknowledgments

- **Blood donation organizations** for inspiration
- **Open source community** for amazing tools
- **Contributors** who helped build this project
- **Healthcare workers** who save lives daily

## 📊 Project Statistics

- **Lines of Code**: 15,000+
- **API Endpoints**: 30+
- **Database Models**: 4 comprehensive models
- **Languages Supported**: 10+ regional languages
- **Security Features**: 15+ implemented
- **Test Coverage**: 80%+

## 🔮 Future Enhancements

- **Mobile App** (React Native)
- **Real-time Chat** between donors and hospitals
- **GPS Integration** for location-based matching
- **AI-powered** donor-recipient matching
- **Blockchain** for donation tracking
- **IoT Integration** for blood storage monitoring
- **Advanced Analytics** with ML predictions
- **Multi-tenant** architecture for multiple organizations

---

**Made with ❤️ for saving lives through blood donation**

*"Every drop counts, every donor matters"*