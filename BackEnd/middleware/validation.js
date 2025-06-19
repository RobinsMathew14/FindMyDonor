const { body, param, query, validationResult } = require('express-validator');

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// User validation rules
const validateUserRegistration = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),
    
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
    
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18 || age > 65) {
        throw new Error('Age must be between 18 and 65 years');
      }
      
      return true;
    }),
    
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
    
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please provide a valid blood group'),
    
  body('weight')
    .isFloat({ min: 45, max: 200 })
    .withMessage('Weight must be between 45 and 200 kg'),
    
  body('height')
    .isFloat({ min: 140, max: 250 })
    .withMessage('Height must be between 140 and 250 cm'),
    
  body('userType')
    .optional()
    .isIn(['donor', 'hospital', 'admin'])
    .withMessage('User type must be donor, hospital, or admin'),
    
  // Address validation
  body('address.street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
    
  body('address.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
    
  body('address.district')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('District must be between 2 and 50 characters'),
    
  body('address.state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
    
  body('address.pincode')
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be a 6-digit number'),
    
  // Emergency contact validation
  body('emergencyContact.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Emergency contact name must be between 2 and 100 characters'),
    
  body('emergencyContact.relationship')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Relationship must be between 2 and 50 characters'),
    
  body('emergencyContact.phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid emergency contact phone number'),
    
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  handleValidationErrors
];

// Blood request validation
const validateBloodRequest = [
  body('patientName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Patient name must be between 2 and 100 characters'),
    
  body('patientAge')
    .isInt({ min: 0, max: 120 })
    .withMessage('Patient age must be between 0 and 120'),
    
  body('patientGender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Patient gender must be male, female, or other'),
    
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please provide a valid blood group'),
    
  body('bloodComponent')
    .isIn(['whole_blood', 'red_cells', 'platelets', 'plasma', 'cryoprecipitate'])
    .withMessage('Please provide a valid blood component'),
    
  body('unitsRequired')
    .isInt({ min: 1, max: 20 })
    .withMessage('Units required must be between 1 and 20'),
    
  body('urgencyLevel')
    .isIn(['critical', 'urgent', 'normal'])
    .withMessage('Urgency level must be critical, urgent, or normal'),
    
  body('medicalCondition')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Medical condition must be between 5 and 200 characters'),
    
  body('doctorName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Doctor name must be between 2 and 100 characters'),
    
  body('doctorContact')
    .isMobilePhone('any')
    .withMessage('Please provide a valid doctor contact number'),
    
  body('hospitalName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Hospital name must be between 2 and 100 characters'),
    
  body('requiredBy')
    .isISO8601()
    .withMessage('Please provide a valid required by date')
    .custom((value) => {
      const requiredDate = new Date(value);
      const today = new Date();
      
      if (requiredDate <= today) {
        throw new Error('Required by date must be in the future');
      }
      
      return true;
    }),
    
  // Contact person validation
  body('contactPerson.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Contact person name must be between 2 and 100 characters'),
    
  body('contactPerson.relationship')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Relationship must be between 2 and 50 characters'),
    
  body('contactPerson.phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid contact phone number'),
    
  body('contactPerson.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid contact email address'),
    
  handleValidationErrors
];

// Donation scheduling validation
const validateDonationScheduling = [
  body('scheduledDate')
    .isISO8601()
    .withMessage('Please provide a valid scheduled date')
    .custom((value) => {
      const scheduledDate = new Date(value);
      const today = new Date();
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 3); // 3 months from now
      
      if (scheduledDate <= today) {
        throw new Error('Scheduled date must be in the future');
      }
      
      if (scheduledDate > maxDate) {
        throw new Error('Scheduled date cannot be more than 3 months in the future');
      }
      
      return true;
    }),
    
  body('timeSlot.start')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
    
  body('timeSlot.end')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
    
  body('donationType')
    .optional()
    .isIn(['voluntary', 'replacement', 'directed', 'autologous'])
    .withMessage('Donation type must be voluntary, replacement, directed, or autologous'),
    
  body('bloodComponent')
    .optional()
    .isIn(['whole_blood', 'red_cells', 'platelets', 'plasma', 'cryoprecipitate'])
    .withMessage('Blood component must be valid'),
    
  handleValidationErrors
];

// Blood inventory validation
const validateBloodInventory = [
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please provide a valid blood group'),
    
  body('component')
    .isIn(['whole_blood', 'red_cells', 'platelets', 'plasma', 'cryoprecipitate'])
    .withMessage('Please provide a valid blood component'),
    
  body('unitsAvailable')
    .isInt({ min: 0 })
    .withMessage('Units available must be a non-negative integer'),
    
  body('maximumCapacity')
    .isInt({ min: 1 })
    .withMessage('Maximum capacity must be at least 1'),
    
  body('minimumStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer'),
    
  body('contactInfo.phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid contact phone number'),
    
  body('contactInfo.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid contact email address'),
    
  handleValidationErrors
];

// Parameter validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} must be a valid ID`),
  handleValidationErrors
];

// Query validation for search and filtering
const validateSearchQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Blood group must be valid'),
    
  query('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
    
  query('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
    
  query('urgency')
    .optional()
    .isIn(['critical', 'urgent', 'normal'])
    .withMessage('Urgency must be critical, urgent, or normal'),
    
  handleValidationErrors
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
    
  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('New password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
    
  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
    
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
    
  body('weight')
    .optional()
    .isFloat({ min: 45, max: 200 })
    .withMessage('Weight must be between 45 and 200 kg'),
    
  body('height')
    .optional()
    .isFloat({ min: 140, max: 250 })
    .withMessage('Height must be between 140 and 250 cm'),
    
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateBloodRequest,
  validateDonationScheduling,
  validateBloodInventory,
  validateObjectId,
  validateSearchQuery,
  validatePasswordChange,
  validateProfileUpdate,
  handleValidationErrors
};