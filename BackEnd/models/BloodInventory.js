const mongoose = require('mongoose');

const bloodInventorySchema = new mongoose.Schema({
  // Hospital/Blood Bank Information
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
  
  // Blood Information
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  component: {
    type: String,
    required: [true, 'Blood component is required'],
    enum: ['whole_blood', 'red_cells', 'platelets', 'plasma', 'cryoprecipitate'],
    default: 'whole_blood'
  },
  
  // Inventory Details
  unitsAvailable: {
    type: Number,
    required: [true, 'Units available is required'],
    min: [0, 'Units cannot be negative'],
    default: 0
  },
  unitsReserved: {
    type: Number,
    default: 0,
    min: [0, 'Reserved units cannot be negative']
  },
  minimumStock: {
    type: Number,
    default: 5,
    min: [0, 'Minimum stock cannot be negative']
  },
  maximumCapacity: {
    type: Number,
    required: [true, 'Maximum capacity is required'],
    min: [1, 'Maximum capacity must be at least 1']
  },
  
  // Quality and Expiry
  expiryTracking: [{
    batchId: {
      type: String,
      required: true
    },
    units: {
      type: Number,
      required: true,
      min: 1
    },
    collectionDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date,
      required: true
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'used', 'expired', 'discarded'],
      default: 'available'
    }
  }],
  
  // Pricing (if applicable)
  pricing: {
    costPerUnit: {
      type: Number,
      min: [0, 'Cost cannot be negative'],
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  
  // Availability Status
  isAvailable: {
    type: Boolean,
    default: true
  },
  availabilityNotes: {
    type: String,
    trim: true,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  },
  
  // Contact Information
  contactInfo: {
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
    },
    emergencyContact: {
      type: String,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    }
  },
  
  // Operating Hours
  operatingHours: {
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } },
    is24x7: { type: Boolean, default: false }
  },
  
  // Statistics
  statistics: {
    totalCollected: { type: Number, default: 0 },
    totalDistributed: { type: Number, default: 0 },
    totalExpired: { type: Number, default: 0 },
    lastCollection: Date,
    lastDistribution: Date
  },
  
  // Verification and Quality
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: Date,
  qualityGrade: {
    type: String,
    enum: ['A', 'B', 'C'],
    default: 'A'
  },
  
  // Location for nearby searches
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  
  // Tracking
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for available units (total - reserved)
bloodInventorySchema.virtual('actualAvailable').get(function() {
  return Math.max(0, this.unitsAvailable - this.unitsReserved);
});

// Virtual for stock status
bloodInventorySchema.virtual('stockStatus').get(function() {
  const available = this.actualAvailable;
  if (available === 0) return 'out_of_stock';
  if (available <= this.minimumStock) return 'low_stock';
  if (available >= this.maximumCapacity * 0.8) return 'high_stock';
  return 'normal';
});

// Virtual for expiry alerts
bloodInventorySchema.virtual('expiryAlerts').get(function() {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  
  return this.expiryTracking.filter(batch => 
    batch.status === 'available' && 
    batch.expiryDate <= threeDaysFromNow
  );
});

// Virtual for capacity utilization percentage
bloodInventorySchema.virtual('capacityUtilization').get(function() {
  return Math.round((this.unitsAvailable / this.maximumCapacity) * 100);
});

// Indexes for better performance
bloodInventorySchema.index({ hospital: 1, bloodGroup: 1, component: 1 });
bloodInventorySchema.index({ bloodGroup: 1, isAvailable: 1, unitsAvailable: 1 });
bloodInventorySchema.index({ location: '2dsphere' });
bloodInventorySchema.index({ 'expiryTracking.expiryDate': 1 });
bloodInventorySchema.index({ lastUpdated: -1 });

// Compound index for efficient searches
bloodInventorySchema.index({ 
  bloodGroup: 1, 
  component: 1, 
  isAvailable: 1, 
  unitsAvailable: -1 
});

// Pre-save middleware to update lastUpdated
bloodInventorySchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Method to reserve units
bloodInventorySchema.methods.reserveUnits = function(units, reservedBy) {
  if (this.actualAvailable < units) {
    throw new Error('Insufficient units available for reservation');
  }
  
  this.unitsReserved += units;
  
  // Log the reservation (you might want to create a separate model for this)
  return this.save();
};

// Method to release reserved units
bloodInventorySchema.methods.releaseReservedUnits = function(units) {
  this.unitsReserved = Math.max(0, this.unitsReserved - units);
  return this.save();
};

// Method to distribute units
bloodInventorySchema.methods.distributeUnits = function(units, distributedTo) {
  if (this.unitsAvailable < units) {
    throw new Error('Insufficient units available for distribution');
  }
  
  this.unitsAvailable -= units;
  this.statistics.totalDistributed += units;
  this.statistics.lastDistribution = new Date();
  
  return this.save();
};

// Method to add units (from donation)
bloodInventorySchema.methods.addUnits = function(units, batchInfo) {
  this.unitsAvailable += units;
  this.statistics.totalCollected += units;
  this.statistics.lastCollection = new Date();
  
  // Add to expiry tracking
  if (batchInfo) {
    this.expiryTracking.push({
      batchId: batchInfo.batchId || `BATCH-${Date.now()}`,
      units: units,
      collectionDate: batchInfo.collectionDate || new Date(),
      expiryDate: batchInfo.expiryDate,
      donorId: batchInfo.donorId,
      status: 'available'
    });
  }
  
  return this.save();
};

// Method to mark expired units
bloodInventorySchema.methods.markExpiredUnits = function() {
  const now = new Date();
  let expiredUnits = 0;
  
  this.expiryTracking.forEach(batch => {
    if (batch.status === 'available' && batch.expiryDate <= now) {
      batch.status = 'expired';
      expiredUnits += batch.units;
    }
  });
  
  if (expiredUnits > 0) {
    this.unitsAvailable = Math.max(0, this.unitsAvailable - expiredUnits);
    this.statistics.totalExpired += expiredUnits;
  }
  
  return this.save();
};

// Method to check if currently open
bloodInventorySchema.methods.isCurrentlyOpen = function() {
  if (this.operatingHours.is24x7) return true;
  
  const now = new Date();
  const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const daySchedule = this.operatingHours[currentDay];
  
  if (!daySchedule.isOpen) return false;
  
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMin] = daySchedule.open.split(':').map(Number);
  const [closeHour, closeMin] = daySchedule.close.split(':').map(Number);
  
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  
  return currentTime >= openTime && currentTime <= closeTime;
};

// Static method to find nearby inventory
bloodInventorySchema.statics.findNearby = function(longitude, latitude, maxDistance = 50000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    isAvailable: true,
    unitsAvailable: { $gt: 0 }
  });
};

// Static method to get low stock alerts
bloodInventorySchema.statics.getLowStockAlerts = function() {
  return this.aggregate([
    {
      $addFields: {
        actualAvailable: { $subtract: ['$unitsAvailable', '$unitsReserved'] }
      }
    },
    {
      $match: {
        $expr: { $lte: ['$actualAvailable', '$minimumStock'] },
        isAvailable: true
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'hospital',
        foreignField: '_id',
        as: 'hospitalInfo'
      }
    }
  ]);
};

module.exports = mongoose.model('BloodInventory', bloodInventorySchema);