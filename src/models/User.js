import { database } from '../config/database';
import logger from './utils/logger.js';

class UserModel {
  // Create or update user (for Auth0 integration)
  static async createOrUpdate(authId, email, username = null) {
    try {
      const db = database.getDatabase();

      // Check if user exists
      const existingUser = await database.get(
        'SELECT * FROM users WHERE auth_id = ?',
        [authId]
      );

      if (existingUser) {
        // Update existing user
        await database.run(
          'UPDATE users SET email = ?, username = ?, updated_at = CURRENT_TIMESTAMP WHERE auth_id = ?',
          [email, username, authId]
        );

        return await database.get('SELECT * FROM users WHERE auth_id = ?', [authId]);
      } else {
        // Create new user
        const result = await database.run(
          'INSERT INTO users (auth_id, email, username) VALUES (?, ?, ?)',
          [authId, email, username]
        );

        return await database.get('SELECT * FROM users WHERE id = ?', [result.id]);
      }
    } catch (error) {
      logger.error('Error in UserModel.createOrUpdate:', error);
      throw error;
    }
  }

  // Get user by Auth0 ID
  static async getByAuthId(authId) {
    try {
      return await database.get(
        'SELECT * FROM users WHERE auth_id = ?',
        [authId]
      );
    } catch (error) {
      logger.error('Error in UserModel.getByAuthId:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getById(id) {
    try {
      return await database.get(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
    } catch (error) {
      logger.error('Error in UserModel.getById:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(authId, updates) {
    try {
      const allowedFields = ['username', 'email'];
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

      values.push(authId);

      await database.run(
        `UPDATE users SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE auth_id = ?`,
        values
      );

      return await this.getByAuthId(authId);
    } catch (error) {
      logger.error('Error in UserModel.updateProfile:', error);
      throw error;
    }
  }
}

export default UserModel;
