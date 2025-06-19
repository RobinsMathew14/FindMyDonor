const express = require('express');
const User = require('../models/User');
const { protect, authorize, authorizeOwnerOrAdmin } = require('../middleware/auth');
const { 
  validateProfileUpdate, 
  validateObjectId, 
  validateSearchQuery 
} = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only) or search donors
// @access  Private/Public (with restrictions)
router.get('/', validateSearchQuery, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      bloodGroup,
      city,
      state,
      userType,
      search,
      isActive = true
    } = req.query;

    // Build query
    const query = {};
    
    // If not admin, only show active donors
    if (!req.user || req.user.userType !== 'admin') {
      query.userType = 'donor';
      query.isActive = true;
      query.isVerified = true;
    } else {
      // Admin can filter by user type and active status
      if (userType) query.userType = userType;
      if (isActive !== undefined) query.isActive = isActive === 'true';
    }

    // Apply filters
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');
    
    // Search functionality
    if (search) {
      query.$or = [
        { fullName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { 'address.city': new RegExp(search, 'i') },
        { 'address.state': new RegExp(search, 'i') }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query
    const users = await User.find(query)
      .select('-password -loginAttempts -lockUntil -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Apply privacy settings for non-admin users
    const publicUsers = users.map(user => {
      if (!req.user || req.user.userType !== 'admin') {
        return user.getPublicProfile();
      }
      return user;
    });

    res.json({
      success: true,
      data: {
        users: publicUsers,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// @route   GET /api/users/donors
// @desc    Get available donors by blood group and location
// @access  Public
router.get('/donors', validateSearchQuery, async (req, res) => {
  try {
    const {
      bloodGroup,
      city,
      state,
      page = 1,
      limit = 10,
      urgency = 'normal'
    } = req.query;

    // Build query for eligible donors
    const query = {
      userType: 'donor',
      isActive: true,
      isVerified: true,
      'healthInfo.isEligible': true
    };

    // Blood group compatibility
    if (bloodGroup) {
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

      const compatibleGroups = compatibility[bloodGroup];
      if (compatibleGroups) {
        query.bloodGroup = { $in: compatibleGroups };
      }
    }

    // Location filters
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');

    // Check last donation date for eligibility
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    query.$or = [
      { 'healthInfo.lastDonation': { $exists: false } },
      { 'healthInfo.lastDonation': null },
      { 'healthInfo.lastDonation': { $lte: threeMonthsAgo } }
    ];

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query with sorting based on urgency
    let sortCriteria = { createdAt: -1 };
    if (urgency === 'critical') {
      sortCriteria = { 'healthInfo.totalDonations': -1, createdAt: -1 };
    }

    const donors = await User.find(query)
      .select('fullName bloodGroup address.city address.state phone email preferences healthInfo.totalDonations createdAt')
      .skip(skip)
      .limit(limitNum)
      .sort(sortCriteria);

    // Apply privacy settings
    const publicDonors = donors.map(donor => donor.getPublicProfile());

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        donors: publicDonors,
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
          urgency
        }
      }
    });

  } catch (error) {
    console.error('Get donors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donors'
    });
  }
});

// @route   GET /api/users/hospitals
// @desc    Get hospitals/blood banks
// @access  Public
router.get('/hospitals', validateSearchQuery, async (req, res) => {
  try {
    const {
      city,
      state,
      hospitalType,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = {
      userType: 'hospital',
      isActive: true,
      isVerified: true
    };

    // Apply filters
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');
    if (hospitalType) query['hospitalInfo.hospitalType'] = hospitalType;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const hospitals = await User.find(query)
      .select('fullName hospitalInfo address phone email preferences createdAt')
      .skip(skip)
      .limit(limitNum)
      .sort({ 'hospitalInfo.hospitalName': 1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        hospitals,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hospitals'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (own profile) or Admin
router.get('/:id', validateObjectId('id'), authorizeOwnerOrAdmin(), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -loginAttempts -lockUntil -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return public profile for non-admin users viewing others
    const userData = (req.user.userType === 'admin' || req.user._id.toString() === user._id.toString()) 
      ? user 
      : user.getPublicProfile();

    res.json({
      success: true,
      data: {
        user: userData
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private (own profile) or Admin
router.put('/:id', protect, validateObjectId('id'), validateProfileUpdate, authorizeOwnerOrAdmin(), async (req, res) => {
  try {
    const allowedUpdates = [
      'fullName', 'phone', 'weight', 'height', 'address', 'emergencyContact',
      'preferences', 'hospitalInfo'
    ];

    // Admin can update additional fields
    if (req.user.userType === 'admin') {
      allowedUpdates.push('isActive', 'isVerified', 'userType');
    }

    // Filter allowed updates
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -loginAttempts -lockUntil -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete/Deactivate user account
// @access  Private (own account) or Admin
router.delete('/:id', protect, validateObjectId('id'), authorizeOwnerOrAdmin(), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete - deactivate account instead of removing
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating account'
    });
  }
});

// @route   POST /api/users/:id/reactivate
// @desc    Reactivate user account (Admin only)
// @access  Private (Admin)
router.post('/:id/reactivate', protect, authorize('admin'), validateObjectId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: 'Account reactivated successfully'
    });

  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating account'
    });
  }
});

// @route   GET /api/users/:id/donation-history
// @desc    Get user's donation history
// @access  Private (own history) or Admin
router.get('/:id/donation-history', protect, validateObjectId('id'), authorizeOwnerOrAdmin(), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const Donation = require('../models/Donation');
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const donations = await Donation.find({ donor: req.params.id })
      .populate('hospital', 'fullName hospitalInfo.hospitalName address')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Donation.countDocuments({ donor: req.params.id });

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
    console.error('Get donation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donation history'
    });
  }
});

// @route   GET /api/users/stats/dashboard
// @desc    Get dashboard statistics (Admin only)
// @access  Private (Admin)
router.get('/stats/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ userType: 'donor' });
    const totalHospitals = await User.countDocuments({ userType: 'hospital' });
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true });

    // Blood group distribution
    const bloodGroupStats = await User.aggregate([
      { $match: { userType: 'donor', isActive: true } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalDonors,
          totalHospitals,
          activeUsers,
          verifiedUsers,
          recentRegistrations
        },
        bloodGroupDistribution: bloodGroupStats,
        metrics: {
          activePercentage: Math.round((activeUsers / totalUsers) * 100),
          verifiedPercentage: Math.round((verifiedUsers / totalUsers) * 100),
          donorPercentage: Math.round((totalDonors / totalUsers) * 100)
        }
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
});

module.exports = router;