import express from 'express';
const router = express.Router();

import CategoryController from '../controllers/categoryController.js';
import { optionalAuth } from '../middleware/auth.js';

// GET /api/categories - Get all categories (public endpoint with optional auth)
router.get('/',
  optionalAuth,
  CategoryController.getCategories
);

// GET /api/categories/:id - Get category by ID
router.get('/:id',
  CategoryController.getCategory
);

// POST /api/categories - Create a new category (protected)
router.post('/',
  optionalAuth,
  CategoryController.createCategory
);

// DELETE /api/categories/:id - Delete category by ID (protected)
router.delete('/:id',
  optionalAuth,
  CategoryController.deleteCategory
);


export default router;
