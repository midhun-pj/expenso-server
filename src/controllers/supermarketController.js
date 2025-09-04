

import logger from '../utils/logger';
import SupermarketModel from '../models/Supermarket';

class SupermarketController {
  // Get all supermarkets
  static async getSupermarkets(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
        search: req.query.search
      };

      const result = await SupermarketModel.getAll(options);

      res.json({
        success: true,
        data: result.supermarkets,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error getting supermarkets:', error);
      next(error);
    }
  }

  // Get supermarket by ID
  static async getSupermarket(req, res, next) {
    try {
      const supermarket = await SupermarketModel.getById(req.params.id);

      if (!supermarket) {
        return res.status(404).json({
          success: false,
          error: 'Supermarket not found'
        });
      }

      res.json({
        success: true,
        data: supermarket
      });
    } catch (error) {
      logger.error('Error getting supermarket:', error);
      next(error);
    }
  }

  // Search supermarkets by name
  static async searchSupermarkets(req, res, next) {
    try {
      const { name } = req.query;

      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Search name must be at least 2 characters'
        });
      }

      const supermarkets = await SupermarketModel.findByName(name.trim());

      res.json({
        success: true,
        data: supermarkets
      });
    } catch (error) {
      logger.error('Error searching supermarkets:', error);
      next(error);
    }
  }

  // Create supermarket (admin only - for now, allow all authenticated users)
  static async createSupermarket(req, res, next) {
    try {
      const supermarket = await SupermarketModel.create(req.body);

      logger.info(`Supermarket created: ${supermarket.id}`);

      res.status(201).json({
        success: true,
        data: supermarket
      });
    } catch (error) {
      logger.error('Error creating supermarket:', error);
      next(error);
    }
  }

  // Update supermarket (admin only - for now, allow all authenticated users)
  static async updateSupermarket(req, res, next) {
    try {
      const supermarket = await SupermarketModel.update(req.params.id, req.body);

      if (!supermarket) {
        return res.status(404).json({
          success: false,
          error: 'Supermarket not found'
        });
      }

      logger.info(`Supermarket updated: ${supermarket.id}`);

      res.json({
        success: true,
        data: supermarket
      });
    } catch (error) {
      logger.error('Error updating supermarket:', error);
      next(error);
    }
  }
}


export default SupermarketController;
