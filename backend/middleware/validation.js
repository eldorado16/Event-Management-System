const { validationResult } = require('express-validator');
const { body, param, query } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  
  handleValidationErrors
];

// Event validation rules
const validateEventCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Event title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Event description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  
  body('category')
    .isIn(['Conference', 'Workshop', 'Seminar', 'Networking', 'Training', 'Social', 'Sports', 'Cultural', 'Other'])
    .withMessage('Invalid event category'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Invalid start date format')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  
  body('endDate')
    .isISO8601()
    .withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid start time format (HH:MM)'),
  
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid end time format (HH:MM)'),
  
  body('venue.name')
    .trim()
    .notEmpty()
    .withMessage('Venue name is required'),
  
  body('venue.capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Venue capacity must be a positive integer'),
  
  body('registrationFee')
    .optional()
    .isNumeric()
    .withMessage('Registration fee must be a number')
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('Registration fee cannot be negative');
      }
      return true;
    }),
  
  body('maxAttendees')
    .isInt({ min: 1 })
    .withMessage('Maximum attendees must be a positive integer'),
  
  body('eventType')
    .optional()
    .isIn(['online', 'offline', 'hybrid'])
    .withMessage('Invalid event type'),
  
  handleValidationErrors
];

const validateEventUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  
  body('category')
    .optional()
    .isIn(['Conference', 'Workshop', 'Seminar', 'Networking', 'Training', 'Social', 'Sports', 'Cultural', 'Other'])
    .withMessage('Invalid event category'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  
  handleValidationErrors
];

// Membership validation rules
const validateMembershipCreation = [
  body('membershipType')
    .isIn(['6months', '1year', '2years'])
    .withMessage('Invalid membership type'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  body('paymentMethod')
    .isIn(['card', 'bank_transfer', 'cash', 'online'])
    .withMessage('Invalid payment method'),
  
  handleValidationErrors
];

// Common validation rules
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),
  
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

const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (req.query.startDate && new Date(value) <= new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateEventCreation,
  validateEventUpdate,
  validateMembershipCreation,
  validateObjectId,
  validatePagination,
  validateDateRange
};