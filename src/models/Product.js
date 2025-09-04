import { database } from '../config/database.js';
import logger from '../utils/logger.js';

class ProductModel {
  static async create(productData) {
    const { name, brand = null } = productData;
    try {
      const result = await database.run(
        `INSERT INTO products (name, brand) VALUES (?, ?)`,
        [name, brand]
      );
      return await this.getById(result.id);
    } catch (error) {
      logger.error('Error in ProductModel.create:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      return await database.get(`SELECT * FROM products WHERE id = ?`, [id]);
    } catch (error) {
      logger.error('Error in ProductModel.getById:', error);
      throw error;
    }
  }

  static async getAll() {
    try {
      return await database.all(`SELECT * FROM products ORDER BY name`);
    } catch (error) {
      logger.error('Error in ProductModel.getAll:', error);
      throw error;
    }
  }

  static async update(id, updates) {
    const allowedFields = ['name', 'brand'];

    const setClause = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        setClause.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (setClause.length === 0) throw new Error('No valid fields to update');

    values.push(id);

    try {
      await database.run(
        `UPDATE products SET ${setClause.join(', ')} WHERE id = ?`,
        values
      );
      return await this.getById(id);
    } catch (error) {
      logger.error('Error in ProductModel.update:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await database.run(`DELETE FROM products WHERE id = ?`, [id]);
      return true;
    } catch (error) {
      logger.error('Error in ProductModel.delete:', error);
      throw error;
    }
  }
}

export default ProductModel;
