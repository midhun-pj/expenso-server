import express from 'express';
const router = express.Router();

import SupermarketController from '../controllers/supermarketController';
import { requireAuth } from '../middleware/auth';
import { validationRules, handleValidationErrors } from '../utils/validation';

// Apply authentication to all routes
router.use(requireAuth);

// GET /api/supermarkets - Get all supermarkets
router.get('/',
  validationRules.paginationQuery,
  handleValidationErrors,
  SupermarketController.getSupermarkets
);

// GET /api/supermarkets/search - Search supermarkets by name
router.get('/search',
  SupermarketController.searchSupermarkets
);

// GET /api/supermarkets/:id - Get supermarket by ID
router.get('/:id',
  validationRules.idParam,
  handleValidationErrors,
  SupermarketController.getSupermarket
);

// POST /api/supermarkets - Create new supermarket
router.post('/',
  validationRules.createSupermarket,
  handleValidationErrors,
  SupermarketController.createSupermarket
);

// PUT /api/supermarkets/:id - Update supermarket
router.put('/:id',
  validationRules.idParam,
  handleValidationErrors,
  SupermarketController.updateSupermarket
);

export default router;
