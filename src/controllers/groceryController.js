import GroceryItemModel from '../models/GroceryItem';
import ExpenseModel from '../models/Expense';
import UserModel from '../models/User';
import logger from '../utils/logger';

class GroceryController {
  // Create grocery item
  static async createGroceryItem(req, res, next) {
    try {
      const user = await UserModel.getByAuthId(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Verify expense exists and belongs to user
      const expense = await ExpenseModel.getById(req.body.expense_id);
      if (!expense || expense.user_id !== user.id) {
        return res.status(404).json({
          success: false,
          error: 'Expense not found or access denied'
        });
      }

      const groceryItem = await GroceryItemModel.create(req.body);

      logger.info(`Grocery item created: ${groceryItem.id} for expense ${expense.id}`);

      res.status(201).json({
        success: true,
        data: groceryItem
      });
    } catch (error) {
      logger.error('Error creating grocery item:', error);
      next(error);
    }
  }

  // Get grocery items for expense
  static async getGroceryItems(req, res, next) {
    try {
      const user = await UserModel.getByAuthId(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Verify expense exists and belongs to user
      const expense = await ExpenseModel.getById(req.params.expenseId);
      if (!expense || expense.user_id !== user.id) {
        return res.status(404).json({
          success: false,
          error: 'Expense not found or access denied'
        });
      }

      const groceryItems = await GroceryItemModel.getByExpenseId(req.params.expenseId);

      res.json({
        success: true,
        data: groceryItems
      });
    } catch (error) {
      logger.error('Error getting grocery items:', error);
      next(error);
    }
  }

  // Update grocery item
  static async updateGroceryItem(req, res, next) {
    try {
      const user = await UserModel.getByAuthId(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Get grocery item and verify ownership
      const groceryItem = await GroceryItemModel.getById(req.params.id);
      if (!groceryItem) {
        return res.status(404).json({
          success: false,
          error: 'Grocery item not found'
        });
      }

      const expense = await ExpenseModel.getById(groceryItem.expense_id);
      if (!expense || expense.user_id !== user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const updatedItem = await GroceryItemModel.update(req.params.id, req.body);

      logger.info(`Grocery item updated: ${updatedItem.id}`);

      res.json({
        success: true,
        data: updatedItem
      });
    } catch (error) {
      logger.error('Error updating grocery item:', error);
      next(error);
    }
  }

  // Delete grocery item
  static async deleteGroceryItem(req, res, next) {
    try {
      const user = await UserModel.getByAuthId(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Get grocery item and verify ownership
      const groceryItem = await GroceryItemModel.getById(req.params.id);
      if (!groceryItem) {
        return res.status(404).json({
          success: false,
          error: 'Grocery item not found'
        });
      }

      const expense = await ExpenseModel.getById(groceryItem.expense_id);
      if (!expense || expense.user_id !== user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      await GroceryItemModel.delete(req.params.id);

      logger.info(`Grocery item deleted: ${req.params.id}`);

      res.json({
        success: true,
        message: 'Grocery item deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting grocery item:', error);
      next(error);
    }
  }

  // Get grocery spending by category
  static async getSpendingByCategory(req, res, next) {
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

      const spending = await GroceryItemModel.getSpendingByCategory(user.id, startDate, endDate);

      res.json({
        success: true,
        data: spending,
        period: { start_date: startDate, end_date: endDate }
      });
    } catch (error) {
      logger.error('Error getting grocery spending by category:', error);
      next(error);
    }
  }
}

export default GroceryController
