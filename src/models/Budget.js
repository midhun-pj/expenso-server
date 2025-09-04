import { database } from '../config/database.js';
import logger from '../utils/logger.js';

class BudgetModel {
  static async getAllByUser(userId) {
    try {
      return await database.all(
        'SELECT * FROM budgets WHERE user_id = ? ORDER BY start_date DESC',
        [userId]
      );
    } catch (error) {
      logger.error('Error in BudgetModel.getAllByUser:', error);
      throw error;
    }
  }
  
  static async getById(id) {
    try {
      return await database.get(
        'SELECT * FROM budgets WHERE id = ?',
        [id]
      );
    } catch (error) {
      logger.error('Error in BudgetModel.getById:', error);
      throw error;
    }
  }
  
  static async create(budgetData) {
    try {
      const {
        user_id,
        category_id = null,
        name,
        amount,
        period,
        start_date,
        end_date = null,
        alert_percentage = 80,
        is_active = true
      } = budgetData;

      const result = await database.run(
        `INSERT INTO budgets 
         (user_id, category_id, name, amount, period, start_date, end_date, alert_percentage, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          category_id,
          name,
          amount,
          period,
          start_date,
          end_date,
          alert_percentage,
          is_active ? 1 : 0
        ]
      );

      return await this.getById(result.id);
    } catch (error) {
      logger.error('Error in BudgetModel.create:', error);
      throw error;
    }
  }

  static async update(id, updates) {
    const allowedFields = ['category_id', 'name', 'amount', 'period', 'start_date', 'end_date', 'alert_percentage', 'is_active'];
    const setClause = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        setClause.push(`${key} = ?`);
        if (key === 'is_active') {
          values.push(value ? 1 : 0);
        } else {
          values.push(value);
        }
      }
    }

    if (setClause.length === 0) throw new Error('No valid fields to update');

    values.push(id);

    try {
      await database.run(
        `UPDATE budgets SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
      return await this.getById(id);
    } catch (error) {
      logger.error('Error in BudgetModel.update:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await database.run('DELETE FROM budgets WHERE id = ?', [id]);
      return true;
    } catch (error) {
      logger.error('Error in BudgetModel.delete:', error);
      throw error;
    }
  }
}

export default BudgetModel;
