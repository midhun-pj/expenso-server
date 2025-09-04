import express from 'express';
const router = express.Router();

import UploadController from '../controllers/uploadController';
import { requireAuth } from '../middleware/auth';
import { receiptUpload } from '../middleware/upload';
import { validationRules, handleValidationErrors } from '../utils/validation';

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