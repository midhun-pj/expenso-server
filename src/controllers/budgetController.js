import logger from '../utils/logger.js';
import BudgetModel from '../models/Budget.js';

class BudgetController {
  static async getBudgets(req, res, next) {
    try {
      const userId = req.user.id;
      const budgets = await BudgetModel.getAllByUser(userId);
      res.json({ success: true, data: budgets });
    } catch (error) {
      logger.error('Error getting budgets:', error);
      next(error);
    }
  }

  static async getBudget(req, res, next) {
    try {
      const budget = await BudgetModel.getById(req.params.id);
      if (!budget) {
        return res.status(404).json({ success: false, error: 'Budget not found' });
      }
      res.json({ success: true, data: budget });
    } catch (error) {
      logger.error('Error getting budget:', error);
      next(error);
    }
  }

  static async createBudget(req, res, next) {
    try {
      const userId = req.user.id;
      const budgetData = { user_id: userId, ...req.body };
      const budget = await BudgetModel.create(budgetData);
      res.status(201).json({ success: true, data: budget });
    } catch (error) {
      logger.error('Error creating budget:', error);
      next(error);
    }
  }

  static async updateBudget(req, res, next) {
    try {
      const budget = await BudgetModel.update(req.params.id, req.body);
      res.json({ success: true, data: budget });
    } catch (error) {
      logger.error('Error updating budget:', error);
      next(error);
    }
  }

  static async deleteBudget(req, res, next) {
    try {
      const success = await BudgetModel.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Budget not found or could not be deleted' });
      }
      res.json({ success: true, message: 'Budget deleted' });
    } catch (error) {
      logger.error('Error deleting budget:', error);
      next(error);
    }
  }
}

export default BudgetController;
