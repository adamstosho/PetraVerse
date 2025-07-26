const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Street address cannot exceed 100 characters'),
  
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),
  
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),
  
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Zip code cannot exceed 10 characters'),
  
  handleValidationErrors
];

const validatePasswordResetRequest = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors
];

const validatePasswordReset = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  
  handleValidationErrors
];

const validatePet = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Pet name must be between 1 and 50 characters'),
  
  body('type')
    .isIn(['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'other'])
    .withMessage('Invalid pet type'),
  
  body('breed')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Breed must be between 1 and 100 characters'),
  
  body('color')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Color must be between 1 and 100 characters'),
  
  body('gender')
    .isIn(['male', 'female', 'unknown'])
    .withMessage('Invalid gender'),
  
  body('age')
    .optional()
    .isFloat({ min: 0, max: 30 })
    .withMessage('Age must be between 0 and 30'),
  
  body('ageUnit')
    .optional()
    .isIn(['days', 'weeks', 'months', 'years'])
    .withMessage('Invalid age unit'),
  
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  
  body('weightUnit')
    .optional()
    .isIn(['kg', 'lbs'])
    .withMessage('Invalid weight unit'),
  
  body('status')
    .isIn(['missing', 'found', 'reunited'])
    .withMessage('Invalid status'),
  
  body('lastSeenLocation.address')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Address must be between 1 and 200 characters'),
  
  body('lastSeenLocation.coordinates.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array with exactly 2 elements')
    .custom((value) => {
      if (!value) return true; 
      const [lng, lat] = value;
      if (lng < -180 || lng > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      if (lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      return true;
    }),
  
  body('lastSeenLocation.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),
  
  body('lastSeenLocation.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),
  
  body('lastSeenLocation.zipCode')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Zip code cannot exceed 10 characters'),
  
  body('lastSeenDate')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date > now) {
        throw new Error('Last seen date cannot be in the future');
      }
      return true;
    }),
  
  body('additionalNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Additional notes cannot exceed 1000 characters'),
  
  body('microchipNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Microchip number cannot exceed 50 characters'),
  
  body('collar.hasCollar')
    .optional()
    .isBoolean()
    .withMessage('Collar status must be a boolean'),
  
  body('collar.color')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Collar color cannot exceed 50 characters'),
  
  body('collar.description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Collar description cannot exceed 200 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each tag cannot exceed 50 characters'),
  
  handleValidationErrors
];

const validatePetSearch = [
  query('status')
    .optional()
    .customSanitizer(value => value === '' ? undefined : value)
    .isIn(['missing', 'found', 'reunited'])
    .withMessage('Invalid status'),
  
  query('type')
    .optional()
    .customSanitizer(value => value === '' ? undefined : value)
    .isIn(['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'other'])
    .withMessage('Invalid pet type'),
  
  query('breed')
    .optional()
    .customSanitizer(value => value === '' ? undefined : value)
    .trim()
    .isLength({ max: 100 })
    .withMessage('Breed search term cannot exceed 100 characters'),
  
  query('color')
    .optional()
    .customSanitizer(value => value === '' ? undefined : value)
    .trim()
    .isLength({ max: 100 })
    .withMessage('Color search term cannot exceed 100 characters'),
  
  query('gender')
    .optional()
    .customSanitizer(value => value === '' ? undefined : value)
    .isIn(['male', 'female', 'unknown'])
    .withMessage('Invalid gender'),
  
  query('location')
    .optional()
    .customSanitizer(value => value === '' ? undefined : value)
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location search term cannot exceed 200 characters'),
  
  query('dateFrom')
    .optional()
    .customSanitizer(value => value === '' ? undefined : value)
    .isISO8601()
    .withMessage('Invalid date format'),
  
  query('dateTo')
    .optional()
    .customSanitizer(value => value === '' ? undefined : value)
    .isISO8601()
    .withMessage('Invalid date format'),
  
  query('latitude')
    .optional()
    .customSanitizer(value => value === '' ? undefined : value)
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  query('longitude')
    .optional()
    .customSanitizer(value => value === '' ? undefined : value)
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  query('radius')
    .optional()
    .customSanitizer(value => value === '' ? undefined : value)
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Radius must be between 0.1 and 100 km'),
  
  query('page')
    .optional()
    .customSanitizer(value => value === '' ? undefined : value)
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .customSanitizer(value => value === '' ? undefined : value)
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

const validateContactRequest = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),
  
  handleValidationErrors
];

const validateReport = [
  body('type')
    .isIn(['user', 'pet_post', 'spam', 'inappropriate', 'fake', 'duplicate', 'other'])
    .withMessage('Invalid report type'),
  
  body('reason')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Reason must be between 1 and 500 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('reportedUserId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('reportedPetId')
    .optional()
    .isMongoId()
    .withMessage('Invalid pet ID'),
  
  body('evidence')
    .optional()
    .isArray()
    .withMessage('Evidence must be an array'),
  
  body('evidence.*')
    .optional()
    .isURL()
    .withMessage('Evidence must be a valid URL'),
  
  (req, res, next) => {
    if (!req.body.reportedUserId && !req.body.reportedPetId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{
          field: 'target',
          message: 'Must specify either a user or pet to report',
          value: null
        }]
      });
    }
    next();
  },
  
  handleValidationErrors
];

const validateAdminAction = [
  body('action')
    .isIn(['approve', 'edit', 'delete', 'warn', 'disable', 'ban'])
    .withMessage('Invalid admin action'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  handleValidationErrors
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordResetRequest,
  validatePasswordReset,
  validatePet,
  validatePetSearch,
  validateContactRequest,
  validateReport,
  validateAdminAction,
  validatePagination,
  validateObjectId
}; 