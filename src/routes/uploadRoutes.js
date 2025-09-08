import express from 'express';
const router = express.Router();

import UploadController from '../controllers/uploadController.js';
import { requireAuth } from '../middleware/auth.js';
import { receiptUpload } from '../middleware/upload.js';
import { validationRules, handleValidationErrors } from '../utils/validation.js';

// Apply authentication to all routes
router.use(requireAuth);

// POST /api/upload/receipt - Upload and process receipt
router.post('/receipt',
  receiptUpload,
  UploadController.uploadReceipt
);

// GET /api/upload/receipt/:id - Get receipt image
router.get('/receipt/:id',
  validationRules.idParam,
  handleValidationErrors,
  UploadController.getReceiptImage
);

// DELETE /api/upload/receipt/:id - Delete receipt image
router.delete('/receipt/:id',
  validationRules.idParam,
  handleValidationErrors,
  UploadController.deleteReceiptImage
);

export default router;