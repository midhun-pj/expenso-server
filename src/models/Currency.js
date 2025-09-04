import { database } from '../config/database.js';
import logger from '../utils/logger.js';

class CurrencyModel {
  // Get all currencies ordered by code
  static async getAll() {
    try {
      return await database.all(
        'SELECT * FROM currencies ORDER BY code'
      );
    } catch (error) {
      logger.error('Error in CurrencyModel.getAll:', error);
      throw error;
    }
  }

  // Get currency by ID
  static async getById(id) {
    try {
      return await database.get(
        'SELECT * FROM currencies WHERE id = ?',
        [id]
      );
    } catch (error) {
      logger.error('Error in CurrencyModel.getById:', error);
      throw error;
    }
  }

  // Create a new currency
  static async create(currencyData) {
    try {
      const { code, name, symbol = null, decimal_places = 2 } = currencyData;

      const result = await database.run(
        `INSERT INTO currencies (code, name, symbol, decimal_places)
         VALUES (?, ?, ?, ?)`,
        [code.toUpperCase(), name, symbol, decimal_places]
      );

      return await this.getById(result.id);
    } catch (error) {
      logger.error('Error in CurrencyModel.create:', error);
      throw error;
    }
  }

  // Update currency by ID
  static async update(id, updates) {
    const allowedFields = ['code', 'name', 'symbol', 'decimal_places'];
    const setClause = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        setClause.push(`${key} = ?`);
        values.push(key === 'code' ? value.toUpperCase() : value);
      }
    }

    if (setClause.length === 0) throw new Error('No valid fields to update');

    values.push(id);

    try {
      await database.run(
        `UPDATE currencies SET ${setClause.join(', ')} WHERE id = ?`,
        values
      );
      return await this.getById(id);
    } catch (error) {
      logger.error('Error in CurrencyModel.update:', error);
      throw error;
    }
  }

  // Delete currency by ID
  static async delete(id) {
    try {
      await database.run('DELETE FROM currencies WHERE id = ?', [id]);
      return true;
    } catch (error) {
      logger.error('Error in CurrencyModel.delete:', error);
      throw error;
    }
  }
}

export default CurrencyModel;
