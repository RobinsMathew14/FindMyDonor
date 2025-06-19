const express = require('express');
const BloodRequest = require('../models/BloodRequest');
const { protect, authorize, authorizeOwnerOrAdmin } = require('../middleware/auth');
const { 
  validateBloodRequest, 
  validateObjectId, 
  validateSearchQuery 
} = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/blood-requests
// @desc    Create a new blood request
// @access  Private (Hospital/Admin)
router.post('/', protect, authorize('hospital', 'admin'), validateBloodRequest, async (req, res) => {
  try {
    const bloodRequestData = {
      ...req.body,
      requestedBy: req.user._id,
      hospital: req.user._id,
      hospitalName: req.user.hospitalInfo?.hospitalName || req.user.fullName
    };

    const bloodRequest = new BloodRequest(bloodRequestData);
    await bloodRequest.save();

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: {
        bloodRequest
      }
    });

  } catch (error) {
    console.error('Create blood request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating blood request'
    });
  }
});

// @route   GET /api/blood-requests
// @desc    Get all blood requests with filters
// @access  Public (with restrictions)
router.get('/', validateSearchQuery, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      bloodGroup,
      city,
      state,
      urgency,
      status = 'active',
      search
    } = req.query;

    // Build query
    const query = {};
    
    // Only show active requests for non-admin users
    if (!req.user || req.user.userType !== 'admin') {
      query.status = 'active';
      query.requiredBy = { $gte: new Date() }; // Not expired
    } else {
      if (status) query.status = status;
    }

    // Apply filters
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (city) query['hospitalAddress.city'] = new RegExp(city, 'i');
    if (state) query['hospitalAddress.state'] = new RegExp(state, 'i');
    if (urgency) query.urgencyLevel = urgency;
    
    // Search functionality
    if (search) {
      query.$or = [
        { patientName: new RegExp(search, 'i') },
        { hospitalName: new RegExp(search, 'i') },
        { medicalCondition: new RegExp(search, 'i') },
        { 'hospitalAddress.city': new RegExp(search, 'i') }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query
    const bloodRequests = await BloodRequest.find(query)
      .populate('requestedBy', 'fullName email phone hospitalInfo')
      .populate('responses.donor', 'fullName bloodGroup phone email address')
      .skip(skip)
      .limit(limitNum)
      .sort({ urgencyLevel: 1, createdAt: -1 }); // Critical first, then newest

    const total = await BloodRequest.countDocuments(query);

    res.json({
      success: true,
      data: {
        bloodRequests,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        },
        filters: {
          bloodGroup,
          city,
          state,
          urgency,
          status
        }
      }
    });

  } catch (error) {
    console.error('Get blood requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blood requests'
    });
  }
});

// @route   GET /api/blood-requests/:id
// @desc    Get blood request by ID
// @access  Public
router.get('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id)
      .populate('requestedBy', 'fullName email phone hospitalInfo address')
      .populate('responses.donor', 'fullName bloodGroup phone email address');

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    res.json({
      success: true,
      data: {
        bloodRequest
      }
    });

  } catch (error) {
    console.error('Get blood request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blood request'
    });
  }
});

// @route   PUT /api/blood-requests/:id
// @desc    Update blood request
// @access  Private (Owner/Admin)
router.put('/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Check ownership or admin
    if (req.user.userType !== 'admin' && 
        bloodRequest.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own requests.'
      });
    }

    const allowedUpdates = [
      'patientName', 'patientAge', 'patientGender', 'unitsRequired',
      'urgencyLevel', 'medicalCondition', 'doctorName', 'doctorContact',
      'requiredBy', 'description', 'contactPerson', 'isEmergency'
    ];

    // Admin can update additional fields
    if (req.user.userType === 'admin') {
      allowedUpdates.push('status', 'isVerified');
    }

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedRequest = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('requestedBy', 'fullName email phone hospitalInfo');

    res.json({
      success: true,
      message: 'Blood request updated successfully',
      data: {
        bloodRequest: updatedRequest
      }
    });

  } catch (error) {
    console.error('Update blood request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating blood request'
    });
  }
});

// @route   DELETE /api/blood-requests/:id
// @desc    Delete blood request
// @access  Private (Owner/Admin)
router.delete('/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Check ownership or admin
    if (req.user.userType !== 'admin' && 
        bloodRequest.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own requests.'
      });
    }

    // Soft delete - mark as cancelled instead of removing
    bloodRequest.status = 'cancelled';
    await bloodRequest.save();

    res.json({
      success: true,
      message: 'Blood request cancelled successfully'
    });

  } catch (error) {
    console.error('Delete blood request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting blood request'
    });
  }
});

// @route   POST /api/blood-requests/:id/respond
// @desc    Respond to a blood request
// @access  Private (Donor)
router.post('/:id/respond', protect, authorize('donor'), validateObjectId('id'), async (req, res) => {
  try {
    const { message, contactInfo } = req.body;

    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    if (!bloodRequest.isActive()) {
      return res.status(400).json({
        success: false,
        message: 'This blood request is no longer active'
      });
    }

    // Check if donor's blood group is compatible
    const compatibleGroups = bloodRequest.getCompatibleBloodGroups();
    if (!compatibleGroups.includes(req.user.bloodGroup)) {
      return res.status(400).json({
        success: false,
        message: 'Your blood group is not compatible with this request'
      });
    }

    const responseData = {
      status: 'interested',
      message: message || '',
      contactInfo: {
        phone: contactInfo?.phone || req.user.phone,
        email: contactInfo?.email || req.user.email
      }
    };

    await bloodRequest.addResponse(req.user._id, responseData);

    res.json({
      success: true,
      message: 'Response submitted successfully',
      data: {
        bloodRequest
      }
    });

  } catch (error) {
    console.error('Respond to blood request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting response'
    });
  }
});

// @route   PUT /api/blood-requests/:id/responses/:donorId
// @desc    Update response status
// @access  Private (Hospital/Admin)
router.put('/:id/responses/:donorId', protect, authorize('hospital', 'admin'), 
  validateObjectId('id'), validateObjectId('donorId'), async (req, res) => {
  try {
    const { status, message } = req.body;

    if (!['interested', 'confirmed', 'donated', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Check ownership or admin
    if (req.user.userType !== 'admin' && 
        bloodRequest.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const additionalData = message ? { message } : {};
    await bloodRequest.updateResponseStatus(req.params.donorId, status, additionalData);

    res.json({
      success: true,
      message: 'Response status updated successfully',
      data: {
        bloodRequest
      }
    });

  } catch (error) {
    console.error('Update response status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating response status'
    });
  }
});

// @route   GET /api/blood-requests/stats/dashboard
// @desc    Get blood request statistics
// @access  Private (Admin)
router.get('/stats/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const totalRequests = await BloodRequest.countDocuments();
    const activeRequests = await BloodRequest.countDocuments({ status: 'active' });
    const fulfilledRequests = await BloodRequest.countDocuments({ status: 'fulfilled' });
    const criticalRequests = await BloodRequest.countDocuments({ 
      status: 'active', 
      urgencyLevel: 'critical' 
    });

    // Blood group distribution
    const bloodGroupStats = await BloodRequest.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Recent requests (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRequests = await BloodRequest.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Response rate
    const requestsWithResponses = await BloodRequest.countDocuments({
      'responses.0': { $exists: true }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalRequests,
          activeRequests,
          fulfilledRequests,
          criticalRequests,
          recentRequests
        },
        bloodGroupDistribution: bloodGroupStats,
        metrics: {
          fulfillmentRate: Math.round((fulfilledRequests / totalRequests) * 100),
          responseRate: Math.round((requestsWithResponses / totalRequests) * 100),
          criticalPercentage: Math.round((criticalRequests / activeRequests) * 100)
        }
      }
    });

  } catch (error) {
    console.error('Get blood request stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

module.exports = router;