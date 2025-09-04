
import { database } from '../config/database';
import logger from '../utils/logger';

import ProductModel from './Product';

class GroceryItemModel {
  // Create grocery item
  static async create(itemData) {
    try {
      const {
        expense_id,
        supermarket_id,
        product_id,
        name = null,
        brand = null,
        quantity = 1,
        unit,
        unit_price,
        total_price } = itemData;

      let currentProductId = product_id;

      if (!product_id) {
        if (!name) {
          throw new Error('Product ID or product name must be provided');
        }

        const newProduct = await ProductModel.create({
          name: name,
          brand,
        });

        currentProductId = newProduct.id;
      }

      const result = await database.run(
        `INSERT INTO grocery_items (
          expense_id, item_name, quantity, unit_price, total_price,
          brand, supermarket_id, unit, product_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          expense_id, item_name, quantity, unit_price, total_price,
          brand, supermarket_id, unit, product_id
        ]
      );

      return await this.getById(result.id);
    } catch (error) {
      logger.error('Error in GroceryItemModel.create:', error);
      throw error;
    }
  }

  static async getByExpenseId(expenseId) {
    try {
      return await database.all(
        `SELECT gi.*, p.name as product_name, p.brand
         FROM grocery_items gi
         JOIN grocery_products p ON gi.product_id = p.id
         WHERE gi.expense_id = ? ORDER BY p.name`,
        [expenseId]
      );
    } catch (error) {
      logger.error('Error in GroceryItemModel.getByExpenseId:', error);
      throw error;
    }
  }

  // Get all items for an expense
  static async getByExpenseId(expenseId) {
    try {
      return await database.all(
        'SELECT * FROM grocery_items WHERE expense_id = ? ORDER BY item_name',
        [expenseId]
      );
    } catch (error) {
      logger.error('Error in GroceryItemModel.getByExpenseId:', error);
      throw error;
    }
  }

  // Update grocery item
  static async update(id, updates) {
    try {
      const allowedFields = [
        'item_name', 'quantity', 'unit_price', 'total_price',
        'category', 'brand', 'size_description'
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

      values.push(id);

      await database.run(
        `UPDATE grocery_items SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );

      return await this.getById(id);
    } catch (error) {
      logger.error('Error in GroceryItemModel.update:', error);
      throw error;
    }
  }

  // Delete grocery item
  static async delete(id) {
    try {
      await database.run('DELETE FROM grocery_items WHERE id = ?', [id]);
      return true;
    } catch (error) {
      logger.error('Error in GroceryItemModel.delete:', error);
      throw error;
    }
  }

  // Bulk create grocery items
  static async createBulk(expenseId, items) {
    try {
      const results = [];

      for (const item of items) {
        const itemData = { expense_id: expenseId, ...item };
        const result = await this.create(itemData);
        results.push(result);
      }

      return results;
    } catch (error) {
      logger.error('Error in GroceryItemModel.createBulk:', error);
      throw error;
    }
  }

  // Get grocery spending by category for user
  static async getSpendingByCategory(userId, startDate, endDate) {
    try {
      return await database.all(`
        SELECT 
          gi.category,
          COUNT(gi.id) as item_count,
          SUM(gi.total_price) as total_spent
        FROM grocery_items gi
        JOIN expenses e ON gi.expense_id = e.id
        WHERE e.user_id = ? AND e.expense_date BETWEEN ? AND ?
        GROUP BY gi.category
        ORDER BY total_spent DESC
      `, [userId, startDate, endDate]);
    } catch (error) {
      logger.error('Error in GroceryItemModel.getSpendingByCategory:', error);
      throw error;
    }
  }
}

export default GroceryItemModel;
