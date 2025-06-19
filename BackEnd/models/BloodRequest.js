const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  // Request Information
  requestId: {
    type: String
  },
  
  // Patient Information
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  patientAge: {
    type: Number,
    required: [true, 'Patient age is required'],
    min: [0, 'Age cannot be negative']
  },
  patientGender: {
    type: String,
    required: [true, 'Patient gender is required'],
    enum: ['male', 'female', 'other']
  },
  
  // Blood Requirements
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  bloodComponent: {
    type: String,
    required: [true, 'Blood component is required'],
    enum: ['whole_blood', 'red_cells', 'platelets', 'plasma', 'cryoprecipitate']
  },
  unitsRequired: {
    type: Number,
    required: [true, 'Units required is mandatory'],
    min: [1, 'At least 1 unit is required']
  },
  urgencyLevel: {
    type: String,
    required: [true, 'Urgency level is required'],
    enum: ['critical', 'urgent', 'normal'],
    default: 'normal'
  },
  
  // Medical Information
  medicalCondition: {
    type: String,
    required: [true, 'Medical condition is required'],
    trim: true
  },
  doctorName: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  doctorContact: {
    type: String,
    required: [true, 'Doctor contact is required'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  
  // Hospital/Location Information
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Hospital information is required']
  },
  hospitalName: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true
  },
  hospitalAddress: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { 
      type: String, 
      required: true, 
      match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
    }
  },
  
  // Request Details
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requiredBy: {
    type: Date,
    required: [true, 'Required by date is mandatory']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Status and Tracking
  status: {
    type: String,
    enum: ['active', 'partially_fulfilled', 'fulfilled', 'expired', 'cancelled'],
    default: 'active'
  },
  unitsFulfilled: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Responses and Donations
  responses: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    responseDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['interested', 'confirmed', 'donated', 'cancelled'],
      default: 'interested'
    },
    message: {
      type: String,
      trim: true,
      maxlength: [200, 'Message cannot exceed 200 characters']
    },
    contactInfo: {
      phone: String,
      email: String
    }
  }],
  
  // Contact Information
  contactPerson: {
    name: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true
    },
    relationship: {
      type: String,
      required: [true, 'Relationship is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }
  },
  
  // Additional Information
  isEmergency: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: { type: Date, default: Date.now }
  }],
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationDate: Date,
  
  // Tracking
  views: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for time remaining
bloodRequestSchema.virtual('timeRemaining').get(function() {
  if (!this.requiredBy) return null;
  const now = new Date();
  const required = new Date(this.requiredBy);
  const diff = required.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expired';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} days, ${hours} hours`;
  return `${hours} hours`;
});

// Virtual for completion percentage
bloodRequestSchema.virtual('completionPercentage').get(function() {
  if (this.unitsRequired === 0) return 0;
  return Math.round((this.unitsFulfilled / this.unitsRequired) * 100);
});

// Virtual for full hospital address
bloodRequestSchema.virtual('fullHospitalAddress').get(function() {
  if (!this.hospitalAddress) return '';
  const { street, city, district, state, pincode } = this.hospitalAddress;
  return `${street}, ${city}, ${district}, ${state} - ${pincode}`;
});

// Indexes for better performance
bloodRequestSchema.index({ requestId: 1 }, { unique: true });
bloodRequestSchema.index({ bloodGroup: 1, status: 1, urgencyLevel: 1 });
bloodRequestSchema.index({ 'hospitalAddress.city': 1, 'hospitalAddress.state': 1 });
bloodRequestSchema.index({ requiredBy: 1, status: 1 });
bloodRequestSchema.index({ requestedBy: 1 });
bloodRequestSchema.index({ createdAt: -1 });

// Pre-save middleware to generate request ID
bloodRequestSchema.pre('save', function(next) {
  if (!this.requestId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.requestId = `BR-${timestamp}-${random}`.toUpperCase();
  }
  
  this.lastUpdated = new Date();
  next();
});

// Pre-save middleware to update status based on fulfillment
bloodRequestSchema.pre('save', function(next) {
  if (this.unitsFulfilled >= this.unitsRequired) {
    this.status = 'fulfilled';
  } else if (this.unitsFulfilled > 0) {
    this.status = 'partially_fulfilled';
  }
  
  // Check if expired
  if (this.requiredBy < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  
  next();
});

// Method to add response
bloodRequestSchema.methods.addResponse = function(donorId, responseData) {
  // Check if donor already responded
  const existingResponse = this.responses.find(
    response => response.donor.toString() === donorId.toString()
  );
  
  if (existingResponse) {
    // Update existing response
    Object.assign(existingResponse, responseData);
  } else {
    // Add new response
    this.responses.push({
      donor: donorId,
      ...responseData
    });
  }
  
  return this.save();
};

// Method to update response status
bloodRequestSchema.methods.updateResponseStatus = function(donorId, status, additionalData = {}) {
  const response = this.responses.find(
    response => response.donor.toString() === donorId.toString()
  );
  
  if (response) {
    response.status = status;
    Object.assign(response, additionalData);
    
    // If donated, increment units fulfilled
    if (status === 'donated') {
      this.unitsFulfilled += 1;
    }
    
    return this.save();
  }
  
  throw new Error('Response not found');
};

// Method to check if request is active
bloodRequestSchema.methods.isActive = function() {
  return this.status === 'active' && this.requiredBy > new Date();
};

// Method to get compatible blood groups
bloodRequestSchema.methods.getCompatibleBloodGroups = function() {
  const compatibility = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  };
  
  return compatibility[this.bloodGroup] || [];
};

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);