import { auth } from 'express-oauth2-jwt-bearer';
import logger from '../utils/logger.js';

// Auth0 JWT verification middleware
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256',
});

// Middleware to extract user information from JWT
const extractUser = async (req, res, next) => {
  try {
    if (req.auth && req.auth.sub) {
      // Extract user ID from Auth0 subject (sub claim)
      req.userId = req.auth.sub;
      req.userEmail = req.auth.email || null;
    }
    next();
  } catch (error) {
    logger.error('Error extracting user from JWT:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

// Optional authentication middleware (for public endpoints that benefit from user context)
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return next();
  }

  // If token exists, verify it
  return checkJwt(req, res, (err) => {
    if (err) {
      // If token is invalid, continue without user context
      logger.warn('Invalid token in optional auth:', err.message);
      return next();
    }

    // Extract user if token is valid
    return extractUser(req, res, next);
  });
};

const requireAuth = [checkJwt, extractUser];

export {
  checkJwt,
  extractUser,
  optionalAuth,
  requireAuth
};
