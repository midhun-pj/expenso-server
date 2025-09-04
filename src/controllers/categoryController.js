import logger from '../utils/logger.js';
import CategoryModel from '../models/Category.js';

class CategoryController {
  // Get all categories
  static async getCategories(req, res, next) {
    try {
      const categories = await CategoryModel.getAll();

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      logger.error('Error getting categories:', error);
      next(error);
    }
  }

  // Get category by ID
  static async getCategory(req, res, next) {
    try {
      const category = await CategoryModel.getById(req.params.id);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      logger.error('Error getting category:', error);
      next(error);
    }
  }

  // Create new category
  static async createCategory(req, res, next) {
    try {
      const categoryData = req.body;
      const newCategory = await CategoryModel.create(categoryData);

      res.status(201).json({
        success: true,
        data: newCategory
      });
    } catch (error) {
      logger.error('Error creating category:', error);
      next(error);
    }
  }

  // Delete category by ID
  static async deleteCategory(req, res, next) {
    try {
      const id = req.params.id;
      const success = await CategoryModel.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Category not found or could not be deleted'
        });
      }

      res.json({
        success: true,
        message: 'Category deleted'
      });
    } catch (error) {
      logger.error('Error deleting category:', error);
      next(error);
    }
  }
}

export default CategoryController;
