import logger from '../utils/logger.js';
import IncomeModel from '../models/Income.js';

class IncomeController {
  static async getIncome(req, res, next) {
    try {
      const userId = req.user.id;
      const incomes = await IncomeModel.getAllByUser(userId);
      res.json({ success: true, data: incomes });
    } catch (error) {
      logger.error('Error getting income:', error);
      next(error);
    }
  }

  static async getIncomeById(req, res, next) {
    try {
      const income = await IncomeModel.getById(req.params.id);
      if (!income) {
        return res.status(404).json({ success: false, error: 'Income not found' });
      }
      res.json({ success: true, data: income });
    } catch (error) {
      logger.error('Error getting income by ID:', error);
      next(error);
    }
  }

  static async createIncome(req, res, next) {
    try {
      const userId = req.user.id;
      const incomeData = { user_id: userId, ...req.body };
      const income = await IncomeModel.create(incomeData);
      res.status(201).json({ success: true, data: income });
    } catch (error) {
      logger.error('Error creating income:', error);
      next(error);
    }
  }

  static async updateIncome(req, res, next) {
    try {
      const income = await IncomeModel.update(req.params.id, req.body);
      res.json({ success: true, data: income });
    } catch (error) {
      logger.error('Error updating income:', error);
      next(error);
    }
  }

  static async deleteIncome(req, res, next) {
    try {
      const success = await IncomeModel.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Income not found or could not be deleted' });
      }
      res.json({ success: true, message: 'Income deleted' });
    } catch (error) {
      logger.error('Error deleting income:', error);
      next(error);
    }
  }
}

export default IncomeController;
