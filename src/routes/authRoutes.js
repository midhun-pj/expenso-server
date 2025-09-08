import express from 'express';
const router = express.Router();

import logger from '../utils/logger.js';

import UserModel from '../models/User.js';

import { requireAuth } from '../middleware/auth.js';

// GET /api/auth/profile - Get user profile
router.get('/profile', requireAuth, async (req, res, next) => {
  try {
    let user = await UserModel.getByAuthId(req.userId);

    if (!user) {
      // Create user if doesn't exist
      user = await UserModel.createOrUpdate(req.userId, req.userEmail);
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        auth_id: user.auth_id,
        email: user.email,
        username: user.username,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    logger.error('Error getting user profile:', error);
    next(error);
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const { username } = req.body;

    const user = await UserModel.updateProfile(req.userId, { username });

    res.json({
      success: true,
      data: {
        id: user.id,
        auth_id: user.auth_id,
        email: user.email,
        username: user.username,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    next(error);
  }
});

// POST /api/auth/validate - Validate token (for frontend to check auth status)
router.post('/validate', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user_id: req.userId
  });
});

export default router;
