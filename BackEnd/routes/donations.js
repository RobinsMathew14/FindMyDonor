const express = require('express');
const Donation = require('../models/Donation');
const { protect, authorize, authorizeOwnerOrAdmin } = require('../middleware/auth');
const { 
  validateDonationScheduling, 
  validateObjectId, 
  validateSearchQuery 
} = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/donations
// @desc    Schedule a new donation
// @access  Private (Donor/Hospital/Admin)
router.post('/', protect, validateDonationScheduling, async (req, res) => {
  try {
    const donationData = {
      ...req.body,
      donor: req.user.userType === 'donor' ? req.user._id : req.body.donor,
      donorName: req.user.userType === 'donor' ? req.user.fullName : req.body.donorName,
      donorBloodGroup: req.user.userType === 'donor' ? req.user.bloodGroup : req.body.donorBloodGroup,
      createdBy: req.user._id
    };

    // If hospital is creating, they must provide donor info
    if (req.user.userType === 'hospital') {
      donationData.hospital = req.user._id;
      donationData.hospitalName = req.user.hospitalInfo?.hospitalName || req.user.fullName;
    }

    const donation = new Donation(donationData);
    await donation.save();

    await donation.populate('donor', 'fullName bloodGroup phone email address');
    await donation.populate('hospital', 'fullName hospitalInfo address');

    res.status(201).json({
      success: true,
      message: 'Donation scheduled successfully',
      data: {
        donation
      }
    });

  } catch (error) {
    console.error('Schedule donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error scheduling donation'
    });
  }
});

// @route   GET /api/donations
// @desc    Get all donations with filters
// @access  Private
router.get('/', protect, validateSearchQuery, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      bloodGroup,
      donorId,
      hospitalId,
      startDate,
      endDate
    } = req.query;

    // Build query based on user type
    const query = {};
    
    if (req.user.userType === 'donor') {
      query.donor = req.user._id;
    } else if (req.user.userType === 'hospital') {
      query.hospital = req.user._id;
    }
    // Admin can see all donations

    // Apply filters
    if (status) query.status = status;
    if (bloodGroup) query.donorBloodGroup = bloodGroup;
    if (donorId) query.donor = donorId;
    if (hospitalId) query.hospital = hospitalId;
    
    // Date range filter
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query
    const donations = await Donation.find(query)
      .populate('donor', 'fullName bloodGroup phone email address')
      .populate('hospital', 'fullName hospitalInfo address')
      .skip(skip)
      .limit(limitNum)
      .sort({ scheduledDate: -1 });

    const total = await Donation.countDocuments(query);

    res.json({
      success: true,
      data: {
        donations,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donations'
    });
  }
});

// @route   GET /api/donations/:id
// @desc    Get donation by ID
// @access  Private (Owner/Admin)
router.get('/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'fullName bloodGroup phone email address healthInfo')
      .populate('hospital', 'fullName hospitalInfo address')
      .populate('createdBy', 'fullName userType')
      .populate('lastUpdatedBy', 'fullName userType');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Check access permissions
    const hasAccess = req.user.userType === 'admin' ||
                     donation.donor._id.toString() === req.user._id.toString() ||
                     donation.hospital._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        donation
      }
    });

  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donation'
    });
  }
});

// @route   PUT /api/donations/:id
// @desc    Update donation
// @access  Private (Owner/Admin)
router.put('/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Check permissions
    const hasAccess = req.user.userType === 'admin' ||
                     donation.donor.toString() === req.user._id.toString() ||
                     donation.hospital.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const allowedUpdates = [
      'scheduledDate', 'timeSlot', 'donationType', 'bloodComponent',
      'preScreening', 'healthQuestionnaire', 'donationProcess',
      'postDonationCare', 'bloodTesting', 'notes'
    ];

    // Admin and hospital can update additional fields
    if (req.user.userType === 'admin' || req.user.userType === 'hospital') {
      allowedUpdates.push('status', 'cancellationReason', 'deferralReason', 'deferralPeriod');
    }

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    updates.lastUpdatedBy = req.user._id;

    const updatedDonation = await Donation.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('donor', 'fullName bloodGroup phone email')
     .populate('hospital', 'fullName hospitalInfo');

    res.json({
      success: true,
      message: 'Donation updated successfully',
      data: {
        donation: updatedDonation
      }
    });

  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating donation'
    });
  }
});

// @route   POST /api/donations/:id/cancel
// @desc    Cancel donation
// @access  Private (Owner/Admin)
router.post('/:id/cancel', protect, validateObjectId('id'), async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation reason is required'
      });
    }

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Check permissions
    const hasAccess = req.user.userType === 'admin' ||
                     donation.donor.toString() === req.user._id.toString() ||
                     donation.hospital.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (donation.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed donation'
      });
    }

    await donation.updateStatus('cancelled', reason, req.user._id);

    res.json({
      success: true,
      message: 'Donation cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling donation'
    });
  }
});

// @route   POST /api/donations/:id/complete
// @desc    Complete donation
// @access  Private (Hospital/Admin)
router.post('/:id/complete', protect, authorize('hospital', 'admin'), validateObjectId('id'), async (req, res) => {
  try {
    const completionData = req.body;

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Check permissions
    if (req.user.userType !== 'admin' && 
        donation.hospital.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (donation.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Only in-progress donations can be completed'
      });
    }

    // Update donation with completion data
    Object.assign(donation, completionData);
    await donation.updateStatus('completed', null, req.user._id);

    res.json({
      success: true,
      message: 'Donation completed successfully',
      data: {
        donation
      }
    });

  } catch (error) {
    console.error('Complete donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing donation'
    });
  }
});

// @route   GET /api/donations/stats/overview
// @desc    Get donation statistics
// @access  Private (Admin/Hospital)
router.get('/stats/overview', protect, authorize('admin', 'hospital'), async (req, res) => {
  try {
    const { hospitalId, startDate, endDate } = req.query;

    // Build match criteria
    const matchCriteria = {};
    
    if (req.user.userType === 'hospital') {
      matchCriteria.hospital = req.user._id;
    } else if (hospitalId) {
      matchCriteria.hospital = mongoose.Types.ObjectId(hospitalId);
    }

    if (startDate || endDate) {
      matchCriteria.actualDonationDate = {};
      if (startDate) matchCriteria.actualDonationDate.$gte = new Date(startDate);
      if (endDate) matchCriteria.actualDonationDate.$lte = new Date(endDate);
    }

    const stats = await Donation.getDonationStats(
      req.user.userType === 'hospital' ? req.user._id : hospitalId,
      startDate && endDate ? { start: startDate, end: endDate } : null
    );

    // Additional statistics
    const totalScheduled = await Donation.countDocuments({
      ...matchCriteria,
      status: { $in: ['scheduled', 'in_progress', 'completed'] }
    });

    const totalCompleted = await Donation.countDocuments({
      ...matchCriteria,
      status: 'completed'
    });

    const totalCancelled = await Donation.countDocuments({
      ...matchCriteria,
      status: 'cancelled'
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalScheduled,
          totalCompleted,
          totalCancelled,
          completionRate: totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0
        },
        detailed: stats[0] || {
          totalDonations: 0,
          totalUnits: 0,
          bloodGroupDistribution: {}
        }
      }
    });

  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donation statistics'
    });
  }
});

module.exports = router;