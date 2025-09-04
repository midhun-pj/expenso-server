const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Ensure upload directories exist
const uploadDir = 'uploads';
const receiptsDir = path.join(uploadDir, 'receipts');

[uploadDir, receiptsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer storage for receipts
const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, receiptsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter for images only
const imageFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg').split(',');

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer for receipt uploads
const uploadReceipt = multer({
  storage: receiptStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1 // Only one file per request
  },
  fileFilter: imageFilter
});

// Middleware to handle upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.error('Multer upload error:', err);

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'File too large. Maximum size allowed is 10MB.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Too many files. Only one file allowed per upload.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: 'Unexpected file field.'
        });
      default:
        return res.status(400).json({
          success: false,
          error: 'File upload error occurred.'
        });
    }
  } else if (err) {
    logger.error('File upload error:', err);
    return res.status(400).json({
      success: false,
      error: err.message || 'File upload failed.'
    });
  }

  next();
};

// Combined middleware for receipt upload
const receiptUpload = [
  uploadReceipt.single('receipt'),
  handleUploadError
];

module.exports = {
  receiptUpload,
  handleUploadError
};
