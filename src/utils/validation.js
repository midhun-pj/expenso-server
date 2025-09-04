import  { body, param, query, validationResult } from 'express-validator';

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  next();
};

// Common validation rules
const validationRules = {
  // Expense validation
  createExpense: [
    body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required and must be less than 255 characters'),
    body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('total_amount').isFloat({ min: 0.01 }).withMessage('Total amount must be a positive number'),
    body('tax_amount').optional().isFloat({ min: 0 }).withMessage('Tax amount must be a non-negative number'),
    body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).withMessage('Invalid currency'),
    body('expense_date').isISO8601().withMessage('Invalid date format'),
    body('category_id').isInt({ min: 1 }).withMessage('Valid category ID is required'),
    body('supermarket_id').optional().isInt({ min: 1 }).withMessage('Invalid supermarket ID'),
    body('is_grocery').optional().isBoolean().withMessage('is_grocery must be boolean')
  ],

  updateExpense: [
    param('id').isInt({ min: 1 }).withMessage('Valid expense ID is required'),
    body('title').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Title must be less than 255 characters'),
    body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('total_amount').optional().isFloat({ min: 0.01 }).withMessage('Total amount must be a positive number'),
    body('tax_amount').optional().isFloat({ min: 0 }).withMessage('Tax amount must be a non-negative number'),
    body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).withMessage('Invalid currency'),
    body('expense_date').optional().isISO8601().withMessage('Invalid date format'),
    body('category_id').optional().isInt({ min: 1 }).withMessage('Valid category ID is required'),
    body('supermarket_id').optional().isInt({ min: 1 }).withMessage('Invalid supermarket ID')
  ],

  // Grocery item validation
  createGroceryItem: [
    body('expense_id').isInt({ min: 1 }).withMessage('Valid expense ID is required'),
    body('item_name').trim().isLength({ min: 1, max: 255 }).withMessage('Item name is required and must be less than 255 characters'),
    body('quantity').optional().isFloat({ min: 0.01 }).withMessage('Quantity must be a positive number'),
    body('unit_price').isFloat({ min: 0.01 }).withMessage('Unit price must be a positive number'),
    body('total_price').isFloat({ min: 0.01 }).withMessage('Total price must be a positive number'),
    body('category').optional().trim().isLength({ max: 100 }).withMessage('Category must be less than 100 characters'),
    body('brand').optional().trim().isLength({ max: 100 }).withMessage('Brand must be less than 100 characters'),
    body('size_description').optional().trim().isLength({ max: 100 }).withMessage('Size description must be less than 100 characters')
  ],

  // Budget validation
  createBudget: [
    body('category_id').optional().isInt({ min: 1 }).withMessage('Invalid category ID'),
    body('budget_amount').isFloat({ min: 0.01 }).withMessage('Budget amount must be a positive number'),
    body('period_type').isIn(['weekly', 'monthly', 'yearly']).withMessage('Invalid period type'),
    body('start_date').isISO8601().withMessage('Invalid start date format'),
    body('end_date').isISO8601().withMessage('Invalid end date format')
  ],

  // Income validation
  createIncome: [
    body('source').trim().isLength({ min: 1, max: 255 }).withMessage('Source is required and must be less than 255 characters'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).withMessage('Invalid currency'),
    body('income_date').isISO8601().withMessage('Invalid date format'),
    body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('recurring').optional().isBoolean().withMessage('Recurring must be boolean')
  ],

  // Supermarket validation
  createSupermarket: [
    body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required and must be less than 255 characters'),
    body('address').optional().trim().isLength({ max: 500 }).withMessage('Address must be less than 500 characters'),
    body('phone').optional().trim().isLength({ max: 20 }).withMessage('Phone must be less than 20 characters')
  ],

  // Common parameter validations
  idParam: [
    param('id').isInt({ min: 1 }).withMessage('Valid ID is required')
  ],

  // Query parameter validations
  paginationQuery: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sort').optional().isIn(['date', 'amount', 'title', 'category']).withMessage('Invalid sort field'),
    query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
  ],

  dateRangeQuery: [
    query('start_date').optional().isISO8601().withMessage('Invalid start date format'),
    query('end_date').optional().isISO8601().withMessage('Invalid end date format')
  ]
};


export  {
  validationRules,
  handleValidationErrors
};
