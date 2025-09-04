import express from 'express';
import BudgetController from '../controllers/budgetController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, BudgetController.getBudgets);
router.get('/:id', BudgetController.getBudget);
router.post('/', optionalAuth, BudgetController.createBudget);
router.put('/:id', optionalAuth, BudgetController.updateBudget);
router.delete('/:id', optionalAuth, BudgetController.deleteBudget);

export default router;
