import { database } from '../config/database.js';
import logger from '../utils/logger.js';

class CategoryModel {
  // Get all categories ordered by name
  static async getAll() {
    try {
      return await database.all(
        'SELECT * FROM categories ORDER BY name'
      );
    } catch (error) {
      logger.error('Error in CategoryModel.getAll:', error);
      throw error;
    }
  }

  // Get category by ID
  static async getById(id) {
    try {
      return await database.get(
        'SELECT * FROM categories WHERE id = ?',
        [id]
      );
    } catch (error) {
      logger.error('Error in CategoryModel.getById:', error);
      throw error;
    }
  }

  // Create new category
  static async create(categoryData) {
    try {
      const {
        user_id,
        name,
        color = null,
        icon = null,
        is_income = false,
      } = categoryData;

      const result = await database.run(
        `INSERT INTO categories
         (user_id, name, color, icon, is_income)
         VALUES (?, ?, ?, ?, ?)`,
        [user_id, name, color, icon, is_income ? 1 : 0]
      );

      return await this.getById(result.id);
    } catch (error) {
      logger.error('Error in CategoryModel.create:', error);
      throw error;
    }
  }
}

export default CategoryModel;
