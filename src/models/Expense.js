
import { database } from '../config/database.js';
import logger from '../utils/logger.js';

class ExpenseModel {
  // Create new expense
  static async create(userId, expenseData) {
    try {
      const {
        category_id,
        supermarket_id,
        title,
        description,
        total_amount,
        tax_amount = 0,
        currency = 'USD',
        expense_date,
        receipt_image_path,
        is_grocery = false
      } = expenseData;

      const result = await database.run(
        `INSERT INTO expenses (
          user_id, category_id, supermarket_id, title, description,
          total_amount, tax_amount, currency, expense_date,
          receipt_image_path, is_grocery
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, category_id, supermarket_id, title, description,
          total_amount, tax_amount, currency, expense_date,
          receipt_image_path, is_grocery
        ]
      );

      return await this.getById(result.id);
    } catch (error) {
      logger.error('Error in ExpenseModel.create:', error);
      throw error;
    }
  }

  // Get expense by ID
  static async getById(id) {
    try {
      return await database.get(`
        SELECT e.*, ec.name as category_name, s.name as supermarket_name
        FROM expenses e
        LEFT JOIN expense_categories ec ON e.category_id = ec.id
        LEFT JOIN supermarkets s ON e.supermarket_id = s.id
        WHERE e.id = ?
      `, [id]);
    } catch (error) {
      logger.error('Error in ExpenseModel.getById:', error);
      throw error;
    }
  }

  // Get expenses by user ID with pagination and filters
  static async getByUserId(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        category_id,
        start_date,
        end_date,
        is_grocery,
        sort = 'expense_date',
        order = 'desc'
      } = options;

      const offset = (page - 1) * limit;
      const conditions = ['e.user_id = ?'];
      const params = [userId];

      // Add filters
      if (category_id) {
        conditions.push('e.category_id = ?');
        params.push(category_id);
      }

      if (start_date) {
        conditions.push('e.expense_date >= ?');
        params.push(start_date);
      }

      if (end_date) {
        conditions.push('e.expense_date <= ?');
        params.push(end_date);
      }

      if (is_grocery !== undefined) {
        conditions.push('e.is_grocery = ?');
        params.push(is_grocery);
      }

      const whereClause = conditions.join(' AND ');
      const orderClause = `ORDER BY e.${sort} ${order.toUpperCase()}`;

      // Get total count
      const countResult = await database.get(
        `SELECT COUNT(*) as total FROM expenses e WHERE ${whereClause}`,
        params
      );

      // Get expenses
      const expenses = await database.all(`
        SELECT e.*, ec.name as category_name, s.name as supermarket_name
        FROM expenses e
        LEFT JOIN expense_categories ec ON e.category_id = ec.id
        LEFT JOIN supermarkets s ON e.supermarket_id = s.id
        WHERE ${whereClause}
        ${orderClause}
        LIMIT ? OFFSET ?
      `, [...params, limit, offset]);

      return {
        expenses,
        pagination: {
          page,
          limit,
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      };
    } catch (error) {
      logger.error('Error in ExpenseModel.getByUserId:', error);
      throw error;
    }
  }

  // Update expense
  static async update(id, userId, updates) {
    try {
      const allowedFields = [
        'category_id', 'supermarket_id', 'title', 'description',
        'total_amount', 'tax_amount', 'currency', 'expense_date',
        'receipt_image_path', 'is_grocery'
      ];

      const setClause = [];
      const values = [];

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key) && value !== undefined) {
          setClause.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (setClause.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(id, userId);

      await database.run(
        `UPDATE expenses SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ? AND user_id = ?`,
        values
      );

      return await this.getById(id);
    } catch (error) {
      logger.error('Error in ExpenseModel.update:', error);
      throw error;
    }
  }

  // Delete expense
  static async delete(id, userId) {
    try {
      await database.run(
        'DELETE FROM expenses WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return true;
    } catch (error) {
      logger.error('Error in ExpenseModel.delete:', error);
      throw error;
    }
  }

  // Get expense summary by category
  static async getSummaryByCategory(userId, startDate, endDate) {
    try {
      return await database.all(`
        SELECT 
          ec.name as category_name,
          ec.color as category_color,
          COUNT(e.id) as expense_count,
          SUM(e.total_amount) as total_amount
        FROM expenses e
        JOIN expense_categories ec ON e.category_id = ec.id
        WHERE e.user_id = ? AND e.expense_date BETWEEN ? AND ?
        GROUP BY e.category_id, ec.name, ec.color
        ORDER BY total_amount DESC
      `, [userId, startDate, endDate]);
    } catch (error) {
      logger.error('Error in ExpenseModel.getSummaryByCategory:', error);
      throw error;
    }
  }

  // Get monthly expense trends
  static async getMonthlyTrends(userId, months = 12) {
    try {
      return await database.all(`
        SELECT 
          strftime('%Y-%m', expense_date) as month,
          SUM(total_amount) as total_amount,
          COUNT(id) as expense_count
        FROM expenses
        WHERE user_id = ? AND expense_date >= date('now', '-${months} months')
        GROUP BY strftime('%Y-%m', expense_date)
        ORDER BY month
      `, [userId]);
    } catch (error) {
      logger.error('Error in ExpenseModel.getMonthlyTrends:', error);
      throw error;
    }
  }
}

export default ExpenseModel;
