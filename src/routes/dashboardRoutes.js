import express from 'express';
const router = express.Router();

import DashboardController from '../controllers/dashboardController.js';

import { requireAuth } from '../middleware/auth.js';

// Apply authentication to all routes
router.use(requireAuth);

// GET /api/dashboard - Get dashboard overview
router.get('/',
  DashboardController.getDashboardOverview
);

// GET /api/dashboard/analytics - Get expense analytics
router.get('/analytics',
  DashboardController.getExpenseAnalytics
);

export default router;
