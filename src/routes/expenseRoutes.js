import express from 'express';
const router = express.Router();

import ExpenseController from '../controllers/expenseController.js';
import { requireAuth } from '../middleware/auth.js';
import  { validationRules, handleValidationErrors } from '../utils/validation.js';

// Apply authentication to all routes
router.use(requireAuth);

// GET /api/expenses - Get all expenses for user
router.get('/',
  validationRules.paginationQuery,
  validationRules.dateRangeQuery,
  handleValidationErrors,
  ExpenseController.getExpenses
);

// GET /api/expenses/summary - Get expense summary by category
router.get('/summary',
  validationRules.dateRangeQuery,
  handleValidationErrors,
  ExpenseController.getExpenseSummary
);

// GET /api/expenses/trends - Get monthly expense trends
router.get('/trends',
  ExpenseController.getMonthlyTrends
);

// GET /api/expenses/:id - Get expense by ID
router.get('/:id',
  validationRules.idParam,
  handleValidationErrors,
  ExpenseController.getExpense
);

// POST /api/expenses - Create new expense
router.post('/',
  validationRules.createExpense,
  handleValidationErrors,
  ExpenseController.createExpense
);

// PUT /api/expenses/:id - Update expense
router.put('/:id',
  validationRules.idParam,
  validationRules.updateExpense,
  handleValidationErrors,
  ExpenseController.updateExpense
);

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id',
  validationRules.idParam,
  handleValidationErrors,
  ExpenseController.deleteExpense
);


export default router;
