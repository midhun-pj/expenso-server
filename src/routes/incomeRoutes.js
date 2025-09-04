import express from 'express';
import IncomeController from '../controllers/incomeController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, IncomeController.getIncome);
router.get('/:id', IncomeController.getIncomeById);
router.post('/', optionalAuth, IncomeController.createIncome);
router.put('/:id', optionalAuth, IncomeController.updateIncome);
router.delete('/:id', optionalAuth, IncomeController.deleteIncome);

export default router;
