
import ExpenseModel from '../models/Expense';
import GroceryItemModel from '../models/GroceryItem';
import UserModel from '../models/User';
import logger from '../utils/logger';

class ExpenseController {
  // Create new expense
  static async createExpense(req, res, next) {
    try {
      // Ensure user exists in database
      const user = await UserModel.createOrUpdate(req.userId, req.userEmail);

      const expense = await ExpenseModel.create(user.id, req.body);

      logger.info(`Expense created: ${expense.id} by user ${user.id}`);

      res.status(201).json({
        success: true,
        data: expense
      });
    } catch (error) {
      logger.error('Error creating expense:', error);
      next(error);
    }
  }

  // Get expense by ID
  static async getExpense(req, res, next) {
    try {
      const user = await UserModel.getByAuthId(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const expense = await ExpenseModel.getById(req.params.id);

      if (!expense) {
        return res.status(404).json({
          success: false,
          error: 'Expense not found'
        });
      }

      // Check if expense belongs to user
      if (expense.user_id !== user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Get grocery items if it's a grocery expense
      if (expense.is_grocery) {
        expense.grocery_items = await GroceryItemModel.getByExpenseId(expense.id);
      }

      res.json({
        success: true,
        data: expense
      });
    } catch (error) {
      logger.error('Error getting expense:', error);
      next(error);
    }
  }

  // Get all expenses for user
  static async getExpenses(req, res, next) {
    try {
      const user = await UserModel.getByAuthId(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        category_id: req.query.category_id,
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        is_grocery: req.query.is_grocery,
        sort: req.query.sort || 'expense_date',
        order: req.query.order || 'desc'
      };

      const result = await ExpenseModel.getByUserId(user.id, options);

      res.json({
        success: true,
        data: result.expenses,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error getting expenses:', error);
      next(error);
    }
  }

  // Update expense
  static async updateExpense(req, res, next) {
    try {
      const user = await UserModel.getByAuthId(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const expense = await ExpenseModel.update(req.params.id, user.id, req.body);

      if (!expense) {
        return res.status(404).json({
          success: false,
          error: 'Expense not found'
        });
      }

      logger.info(`Expense updated: ${expense.id} by user ${user.id}`);

      res.json({
        success: true,
        data: expense
      });
    } catch (error) {
      logger.error('Error updating expense:', error);
      next(error);
    }
  }

  // Delete expense
  static async deleteExpense(req, res, next) {
    try {
      const user = await UserModel.getByAuthId(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const success = await ExpenseModel.delete(req.params.id, user.id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Expense not found'
        });
      }

      logger.info(`Expense deleted: ${req.params.id} by user ${user.id}`);

      res.json({
        success: true,
        message: 'Expense deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting expense:', error);
      next(error);
    }
  }

  // Get expense summary by category
  static async getExpenseSummary(req, res, next) {
    try {
      const user = await UserModel.getByAuthId(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const startDate = req.query.start_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const endDate = req.query.end_date || new Date().toISOString().split('T')[0];

      const summary = await ExpenseModel.getSummaryByCategory(user.id, startDate, endDate);

      res.json({
        success: true,
        data: summary,
        period: { start_date: startDate, end_date: endDate }
      });
    } catch (error) {
      logger.error('Error getting expense summary:', error);
      next(error);
    }
  }

  // Get monthly trends
  static async getMonthlyTrends(req, res, next) {
    try {
      const user = await UserModel.getByAuthId(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const months = parseInt(req.query.months) || 12;
      const trends = await ExpenseModel.getMonthlyTrends(user.id, months);

      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      logger.error('Error getting monthly trends:', error);
      next(error);
    }
  }
}

export default ExpenseController;
