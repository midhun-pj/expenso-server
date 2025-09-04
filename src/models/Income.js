import { database } from '../config/database.js';
import logger from '../utils/logger.js';

class IncomeModel {
  static async getAllByUser(userId) {
    try {
      return await database.all(
        'SELECT * FROM income WHERE user_id = ? ORDER BY income_date DESC',
        [userId]
      );
    } catch (error) {
      logger.error('Error in IncomeModel.getAllByUser:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      return await database.get(
        'SELECT * FROM income WHERE id = ?',
        [id]
      );
    } catch (error) {
      logger.error('Error in IncomeModel.getById:', error);
      throw error;
    }
  }

  static async create(incomeData) {
    try {
      const {
        user_id,
        category_id = null,
        title,
        description = null,
        amount,
        currency = 'USD',
        income_date,
        source = null,
        is_recurring = false,
        recurring_frequency = null
      } = incomeData;

      const result = await database.run(
        `INSERT INTO income
        (user_id, category_id, title, description, amount, currency, income_date, source, is_recurring, recurring_frequency)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          category_id,
          title,
          description,
          amount,
          currency,
          income_date,
          source,
          is_recurring ? 1 : 0,
          recurring_frequency
        ]
      );

      return await this.getById(result.id);
    } catch (error) {
      logger.error('Error in IncomeModel.create:', error);
      throw error;
    }
  }

  static async update(id, updates) {
    const allowedFields = ['category_id', 'title', 'description', 'amount', 'currency', 'income_date', 'source', 'is_recurring', 'recurring_frequency'];
    const setClause = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        setClause.push(`${key} = ?`);
        if (key === 'is_recurring') {
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
        `UPDATE income SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
      return await this.getById(id);
    } catch (error) {
      logger.error('Error in IncomeModel.update:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await database.run('DELETE FROM income WHERE id = ?', [id]);
      return true;
    } catch (error) {
      logger.error('Error in IncomeModel.delete:', error);
      throw error;
    }
  }
}

export default IncomeModel;
