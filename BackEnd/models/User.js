const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other']
  },
  
  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  
  // Blood Information
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [45, 'Weight must be at least 45 kg']
  },
  height: {
    type: Number,
    required: [true, 'Height is required'],
    min: [140, 'Height must be at least 140 cm']
  },
  
  // Address Information
  address: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { 
      type: String, 
      required: true, 
      match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
    },
    country: { type: String, default: 'India', trim: true }
  },
  
  // Emergency Contact
  emergencyContact: {
    name: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    phone: { 
      type: String, 
      required: true, 
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    }
  },
  
  // User Type and Status
  userType: {
    type: String,
    required: true,
    enum: ['donor', 'hospital', 'admin'],
    default: 'donor'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Health Information (for donors)
  healthInfo: {
    lastDonation: { type: Date },
    totalDonations: { type: Number, default: 0 },
    medicalConditions: [{ type: String }],
    medications: [{ type: String }],
    allergies: [{ type: String }],
    isEligible: { type: Boolean, default: true },
    eligibilityNotes: { type: String }
  },
  
  // Hospital Information (for hospitals)
  hospitalInfo: {
    hospitalName: { type: String },
    licenseNumber: { type: String },
    hospitalType: { 
      type: String, 
      enum: ['government', 'private', 'charitable', 'corporate']
    },
    bedCapacity: { type: Number },
    bloodBankLicense: { type: String },
    facilities: [{ type: String }]
  },
  
  // Profile and Preferences
  avatar: {
    type: String, // URL to profile picture
    default: null
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    privacy: {
      showPhone: { type: Boolean, default: true },
      showEmail: { type: Boolean, default: false },
      showAddress: { type: Boolean, default: false }
    },
    language: { type: String, default: 'english' }
  },
  
  // Security and Tracking
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for age calculation
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, district, state, pincode } = this.address;
  return `${street}, ${city}, ${district}, ${state} - ${pincode}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Indexes for better performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ bloodGroup: 1, userType: 1, isActive: 1 });
userSchema.index({ 'address.city': 1, 'address.state': 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to check donation eligibility
userSchema.methods.checkDonationEligibility = function() {
  if (this.userType !== 'donor') return false;
  if (!this.isActive || !this.isVerified) return false;
  if (this.age < 18 || this.age > 65) return false;
  if (this.weight < 45) return false;
  
  // Check last donation date (minimum 3 months gap)
  if (this.healthInfo.lastDonation) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    if (this.healthInfo.lastDonation > threeMonthsAgo) return false;
  }
  
  return this.healthInfo.isEligible;
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  
  // Remove sensitive information
  delete user.password;
  delete user.loginAttempts;
  delete user.lockUntil;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  
  // Apply privacy settings
  if (!user.preferences.privacy.showPhone) {
    user.phone = user.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
  }
  if (!user.preferences.privacy.showEmail) {
    user.email = user.email.replace(/(.{2}).*(@.*)/, '$1****$2');
  }
  if (!user.preferences.privacy.showAddress) {
    user.address = {
      city: user.address.city,
      state: user.address.state
    };
  }
  
  return user;
};

module.exports = mongoose.model('User', userSchema);