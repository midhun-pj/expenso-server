import { database } from '../config/database.js';
import logger from '../utils/logger.js';


class SupermarketModel {
  // Create supermarket
  static async create(supermarketData) {
    try {
      const { name, location } = supermarketData;

      const result = await database.run(
        'INSERT INTO supermarkets (name, location) VALUES (?, ?)',
        [name, location]
      );

      return await this.getById(result.id);
    } catch (error) {
      logger.error('Error in SupermarketModel.create:', error);
      throw error;
    }
  }

  // Get supermarket by ID
  static async getById(id) {
    try {
      return await database.get(
        'SELECT * FROM supermarkets WHERE id = ?',
        [id]
      );
    } catch (error) {
      logger.error('Error in SupermarketModel.getById:', error);
      throw error;
    }
  }

  // Get all supermarkets
  static async getAll(options = {}) {
    try {
      const { page = 1, limit = 50, search } = options;
      const offset = (page - 1) * limit;

      let query = 'SELECT * FROM supermarkets';
      let params = [];

      if (search) {
        query += ' WHERE name LIKE ?';
        params.push(`%${search}%`);
      }

      query += ' ORDER BY name LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const supermarkets = await database.all(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM supermarkets';
      let countParams = [];

      if (search) {
        countQuery += ' WHERE name LIKE ?';
        countParams.push(`%${search}%`);
      }

      const countResult = await database.get(countQuery, countParams);

      return {
        supermarkets,
        pagination: {
          page,
          limit,
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      };
    } catch (error) {
      logger.error('Error in SupermarketModel.getAll:', error);
      throw error;
    }
  }

  // Find supermarket by name (fuzzy search)
  static async findByName(name) {
    try {
      return await database.all(
        'SELECT * FROM supermarkets WHERE name LIKE ? ORDER BY name',
        [`%${name}%`]
      );
    } catch (error) {
      logger.error('Error in SupermarketModel.findByName:', error);
      throw error;
    }
  }

  // Update supermarket
  static async update(id, updates) {
    try {
      const allowedFields = ['name', 'location'];
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
        `UPDATE supermarkets SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );

      return await this.getById(id);
    } catch (error) {
      logger.error('Error in SupermarketModel.update:', error);
      throw error;
    }
  }

  // Delete supermarket
  static async delete(id) {
    try {
      await database.run('DELETE FROM supermarkets WHERE id = ?', [id]);
      return true;
    } catch (error) {
      logger.error('Error in SupermarketModel.delete:', error);
      throw error;
    }
  }

  // Get or create supermarket by name
  static async getOrCreate(name, additionalData = {}) {
    try {
      // First, try to find existing supermarket
      const existing = await database.get(
        'SELECT * FROM supermarkets WHERE LOWER(name) = LOWER(?)',
        [name]
      );

      if (existing) {
        return existing;
      }

      // Create new supermarket
      return await this.create({
        name,
        ...additionalData
      });
    } catch (error) {
      logger.error('Error in SupermarketModel.getOrCreate:', error);
      throw error;
    }
  }
}

export default SupermarketModel;
