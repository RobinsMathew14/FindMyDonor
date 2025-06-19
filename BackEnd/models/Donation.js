const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  // Donation Identification
  donationId: {
    type: String,
    required: true
  },
  
  // Donor Information
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Donor reference is required']
  },
  donorName: {
    type: String,
    required: [true, 'Donor name is required'],
    trim: true
  },
  donorBloodGroup: {
    type: String,
    required: [true, 'Donor blood group is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  
  // Hospital/Collection Center Information
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Hospital reference is required']
  },
  hospitalName: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true
  },
  collectionCenter: {
    name: { type: String, trim: true },
    address: { type: String, trim: true },
    contactPhone: { type: String }
  },
  
  // Donation Details
  donationType: {
    type: String,
    required: [true, 'Donation type is required'],
    enum: ['voluntary', 'replacement', 'directed', 'autologous'],
    default: 'voluntary'
  },
  bloodComponent: {
    type: String,
    required: [true, 'Blood component is required'],
    enum: ['whole_blood', 'red_cells', 'platelets', 'plasma', 'cryoprecipitate'],
    default: 'whole_blood'
  },
  unitsCollected: {
    type: Number,
    required: [true, 'Units collected is required'],
    min: [1, 'At least 1 unit must be collected'],
    default: 1
  },
  
  // Scheduling
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  actualDonationDate: {
    type: Date
  },
  timeSlot: {
    start: { type: String }, // Format: "HH:MM"
    end: { type: String }    // Format: "HH:MM"
  },
  
  // Pre-Donation Screening
  preScreening: {
    weight: {
      type: Number,
      required: [true, 'Weight is required for screening'],
      min: [45, 'Minimum weight is 45 kg']
    },
    bloodPressure: {
      systolic: { type: Number, required: true },
      diastolic: { type: Number, required: true }
    },
    pulse: {
      type: Number,
      required: [true, 'Pulse rate is required'],
      min: [50, 'Pulse rate too low'],
      max: [120, 'Pulse rate too high']
    },
    temperature: {
      type: Number,
      required: [true, 'Temperature is required'],
      min: [36, 'Temperature too low'],
      max: [37.5, 'Temperature too high']
    },
    hemoglobin: {
      type: Number,
      required: [true, 'Hemoglobin level is required'],
      min: [12.5, 'Hemoglobin level too low']
    },
    screeningNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Screening notes cannot exceed 500 characters']
    },
    screenedBy: {
      type: String,
      required: [true, 'Screener name is required'],
      trim: true
    },
    screeningDate: {
      type: Date,
      default: Date.now
    }
  },
  
  // Health Questionnaire
  healthQuestionnaire: {
    recentIllness: { type: Boolean, default: false },
    medications: [{ type: String }],
    allergies: [{ type: String }],
    recentTravel: { type: Boolean, default: false },
    recentVaccination: { type: Boolean, default: false },
    pregnancyStatus: { type: String, enum: ['not_applicable', 'not_pregnant', 'pregnant', 'breastfeeding'] },
    lastDonationDate: { type: Date },
    riskFactors: [{ type: String }],
    additionalNotes: { type: String, trim: true }
  },
  
  // Donation Process
  donationProcess: {
    startTime: { type: Date },
    endTime: { type: Date },
    collectionMethod: {
      type: String,
      enum: ['standard', 'apheresis', 'automated'],
      default: 'standard'
    },
    bagNumber: {
      type: String,
      required: [true, 'Bag number is required']
    },
    volume: {
      type: Number, // in ml
      required: [true, 'Collection volume is required']
    },
    complications: [{
      type: { type: String },
      description: { type: String },
      severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
      treatment: { type: String }
    }],
    collectedBy: {
      type: String,
      required: [true, 'Collector name is required'],
      trim: true
    }
  },
  
  // Post-Donation Care
  postDonationCare: {
    restPeriod: { type: Number, default: 15 }, // minutes
    refreshmentsProvided: { type: Boolean, default: true },
    adverseReactions: [{
      type: { type: String },
      severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
      treatment: { type: String },
      resolved: { type: Boolean, default: true }
    }],
    instructions: { type: String, trim: true },
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date }
  },
  
  // Blood Testing
  bloodTesting: {
    testingDate: { type: Date },
    testResults: {
      bloodGroup: { type: String },
      rhFactor: { type: String, enum: ['positive', 'negative'] },
      hiv: { type: String, enum: ['negative', 'positive', 'pending'] },
      hepatitisB: { type: String, enum: ['negative', 'positive', 'pending'] },
      hepatitisC: { type: String, enum: ['negative', 'positive', 'pending'] },
      syphilis: { type: String, enum: ['negative', 'positive', 'pending'] },
      malaria: { type: String, enum: ['negative', 'positive', 'pending'] },
      additionalTests: [{
        testName: { type: String },
        result: { type: String },
        normalRange: { type: String }
      }]
    },
    testingLab: { type: String, trim: true },
    testedBy: { type: String, trim: true },
    qualityGrade: { type: String, enum: ['A', 'B', 'C', 'rejected'] }
  },
  
  // Status and Tracking
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'deferred', 'rejected'],
    default: 'scheduled'
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  deferralReason: {
    type: String,
    trim: true
  },
  deferralPeriod: {
    type: Number // days
  },
  
  // Blood Usage
  bloodUsage: {
    isUsed: { type: Boolean, default: false },
    usedDate: { type: Date },
    usedFor: { type: String, trim: true },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    expiryDate: { type: Date },
    discardedDate: { type: Date },
    discardReason: { type: String, trim: true }
  },
  
  // Certificates and Documentation
  certificates: {
    donationCertificate: {
      issued: { type: Boolean, default: false },
      issueDate: { type: Date },
      certificateNumber: { type: String }
    },
    healthCertificate: {
      issued: { type: Boolean, default: false },
      issueDate: { type: Date },
      validUntil: { type: Date }
    }
  },
  
  // Feedback and Rating
  feedback: {
    donorRating: { type: Number, min: 1, max: 5 },
    donorComments: { type: String, trim: true },
    hospitalRating: { type: Number, min: 1, max: 5 },
    hospitalComments: { type: String, trim: true },
    overallExperience: { type: String, enum: ['excellent', 'good', 'average', 'poor'] }
  },
  
  // Administrative
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for donation duration
donationSchema.virtual('donationDuration').get(function() {
  if (!this.donationProcess.startTime || !this.donationProcess.endTime) return null;
  
  const duration = this.donationProcess.endTime - this.donationProcess.startTime;
  return Math.round(duration / (1000 * 60)); // duration in minutes
});

// Virtual for days since donation
donationSchema.virtual('daysSinceDonation').get(function() {
  if (!this.actualDonationDate) return null;
  
  const now = new Date();
  const donationDate = new Date(this.actualDonationDate);
  const diffTime = Math.abs(now - donationDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for next eligible donation date
donationSchema.virtual('nextEligibleDate').get(function() {
  if (!this.actualDonationDate || this.status !== 'completed') return null;
  
  const donationDate = new Date(this.actualDonationDate);
  const nextDate = new Date(donationDate);
  
  // Add 3 months (90 days) for whole blood donation
  if (this.bloodComponent === 'whole_blood') {
    nextDate.setDate(nextDate.getDate() + 90);
  } else if (this.bloodComponent === 'platelets') {
    nextDate.setDate(nextDate.getDate() + 7); // 1 week for platelets
  } else {
    nextDate.setDate(nextDate.getDate() + 30); // 1 month for other components
  }
  
  return nextDate;
});

// Indexes for better performance
donationSchema.index({ donationId: 1 }, { unique: true });
donationSchema.index({ 'donationProcess.bagNumber': 1 }, { unique: true, sparse: true });
donationSchema.index({ donor: 1, actualDonationDate: -1 });
donationSchema.index({ hospital: 1, scheduledDate: -1 });
donationSchema.index({ status: 1, scheduledDate: 1 });
donationSchema.index({ donorBloodGroup: 1, status: 1 });
donationSchema.index({ createdAt: -1 });

// Pre-save middleware to generate donation ID
donationSchema.pre('save', function(next) {
  if (!this.donationId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.donationId = `DON-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Pre-save middleware to set actual donation date when status changes to completed
donationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.actualDonationDate) {
    this.actualDonationDate = new Date();
  }
  next();
});

// Method to check if donation is eligible
donationSchema.methods.checkEligibility = function() {
  const issues = [];
  
  // Check age (18-65)
  const age = this.donor.age;
  if (age < 18 || age > 65) {
    issues.push('Age must be between 18 and 65 years');
  }
  
  // Check weight
  if (this.preScreening.weight < 45) {
    issues.push('Weight must be at least 45 kg');
  }
  
  // Check hemoglobin
  if (this.preScreening.hemoglobin < 12.5) {
    issues.push('Hemoglobin level too low');
  }
  
  // Check blood pressure
  const { systolic, diastolic } = this.preScreening.bloodPressure;
  if (systolic > 180 || systolic < 90 || diastolic > 100 || diastolic < 60) {
    issues.push('Blood pressure outside acceptable range');
  }
  
  // Check pulse
  if (this.preScreening.pulse < 50 || this.preScreening.pulse > 120) {
    issues.push('Pulse rate outside acceptable range');
  }
  
  // Check temperature
  if (this.preScreening.temperature > 37.5) {
    issues.push('Temperature too high');
  }
  
  return {
    eligible: issues.length === 0,
    issues: issues
  };
};

// Method to calculate next eligible donation date
donationSchema.methods.calculateNextEligibleDate = function() {
  if (!this.actualDonationDate || this.status !== 'completed') return null;
  
  const donationDate = new Date(this.actualDonationDate);
  const nextDate = new Date(donationDate);
  
  // Different intervals for different components
  switch (this.bloodComponent) {
    case 'whole_blood':
      nextDate.setDate(nextDate.getDate() + 90); // 3 months
      break;
    case 'platelets':
      nextDate.setDate(nextDate.getDate() + 7); // 1 week
      break;
    case 'plasma':
      nextDate.setDate(nextDate.getDate() + 28); // 4 weeks
      break;
    default:
      nextDate.setDate(nextDate.getDate() + 90); // Default 3 months
  }
  
  return nextDate;
};

// Method to update donation status
donationSchema.methods.updateStatus = function(newStatus, reason = null, updatedBy = null) {
  this.status = newStatus;
  
  if (reason) {
    if (newStatus === 'cancelled') {
      this.cancellationReason = reason;
    } else if (newStatus === 'deferred') {
      this.deferralReason = reason;
    }
  }
  
  if (updatedBy) {
    this.lastUpdatedBy = updatedBy;
  }
  
  if (newStatus === 'completed' && !this.actualDonationDate) {
    this.actualDonationDate = new Date();
  }
  
  return this.save();
};

// Static method to get donation statistics
donationSchema.statics.getDonationStats = function(hospitalId = null, dateRange = null) {
  const matchStage = { status: 'completed' };
  
  if (hospitalId) {
    matchStage.hospital = mongoose.Types.ObjectId(hospitalId);
  }
  
  if (dateRange) {
    matchStage.actualDonationDate = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalDonations: { $sum: 1 },
        totalUnits: { $sum: '$unitsCollected' },
        bloodGroupStats: {
          $push: {
            bloodGroup: '$donorBloodGroup',
            units: '$unitsCollected'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalDonations: 1,
        totalUnits: 1,
        bloodGroupDistribution: {
          $reduce: {
            input: '$bloodGroupStats',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [[{
                    k: '$$this.bloodGroup',
                    v: { $add: [{ $ifNull: [{ $getField: { field: '$$this.bloodGroup', input: '$$value' } }, 0] }, '$$this.units'] }
                  }]]
                }
              ]
            }
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Donation', donationSchema);