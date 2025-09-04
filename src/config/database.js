import sqlite3 from 'sqlite3';
import fs from 'fs';
import  path from 'path';
import logger from '../utils/logger';

const sqlite = sqlite3.verbose();

class Database {
  constructor() {
    this.db = null;
    this.dbPath = process.env.DATABASE_PATH || '../database/expense_tracker.db';
  }

  // Initialize database connection
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        // Ensure database directory exists
        const dbDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true });
        }

        this.db = new sqlite3.Database(this.dbPath, (err) => {
          if (err) {
            logger.error('Error opening database:', err.message);
            reject(err);
          } else {
            logger.info(`Connected to SQLite database: ${this.dbPath}`);

            // Enable foreign keys
            this.db.run('PRAGMA foreign_keys = ON', (err) => {
              if (err) {
                logger.error('Error enabling foreign keys:', err.message);
                reject(err);
              } else {
                logger.info('Foreign key constraints enabled');
                resolve();
              }
            });
          }
        });
      } catch (error) {
        logger.error('Database connection error:', error);
        reject(error);
      }
    });
  }

  // Initialize database schema
  async initSchema() {
    return new Promise((resolve, reject) => {
      const schemaPath = path.join(__dirname, '../../database_schema.sql');

      if (!fs.existsSync(schemaPath)) {
        logger.error('Schema file not found:', schemaPath);
        reject(new Error('Schema file not found'));
        return;
      }

      const schema = fs.readFileSync(schemaPath, 'utf8');

      this.db.exec(schema, (err) => {
        if (err) {
          logger.error('Error initializing database schema:', err.message);
          reject(err);
        } else {
          logger.info('Database schema initialized successfully');
          resolve();
        }
      });
    });
  }

  // Get database instance
  getDatabase() {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  // Run query with parameters
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          logger.error('Database run error:', err.message);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  // Get single row
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          logger.error('Database get error:', err.message);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Get all rows
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          logger.error('Database all error:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Close database connection
  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            logger.error('Error closing database:', err.message);
            reject(err);
          } else {
            logger.info('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

// Create singleton instance
export const database = new Database();
