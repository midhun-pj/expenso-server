import express from 'express';
const router = express.Router();

import GroceryController from '../controllers/groceryController.js';
import { requireAuth } from '../middleware/auth.js';
import  { validationRules, handleValidationErrors } from '../utils/validation.js';

// Apply authentication to all routes
router.use(requireAuth);

// GET /api/groceries/spending - Get grocery spending by category
router.get('/spending',
  validationRules.dateRangeQuery,
  handleValidationErrors,
  GroceryController.getSpendingByCategory
);

// GET /api/groceries/expense/:expenseId - Get all grocery items for an expense
router.get('/expense/:expenseId',
  validationRules.idParam,
  handleValidationErrors,
  GroceryController.getGroceryItems
);

// POST /api/groceries - Create new grocery item
router.post('/',
  validationRules.createGroceryItem,
  handleValidationErrors,
  GroceryController.createGroceryItem
);

// PUT /api/groceries/:id - Update grocery item
router.put('/:id',
  validationRules.idParam,
  handleValidationErrors,
  GroceryController.updateGroceryItem
);

// DELETE /api/groceries/:id - Delete grocery item
router.delete('/:id',
  validationRules.idParam,
  handleValidationErrors,
  GroceryController.deleteGroceryItem
);

export default router;
