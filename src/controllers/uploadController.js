import multer from 'multer';
import path from 'path';
import fs from 'fs'
import UserModel from '../models/User';
import SupermarketModel from '../models/Supermarket';
import GroceryItemModel from '../models/GroceryItem';
import ExpenseModel from '../models/Expense';
i

import ocrService from '../services/ocrService';
import FileUtils from '../utils/fileUtils';
import logger from '../utils/logger';

class UploadController {
  // Upload and process receipt
  static async uploadReceipt(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const user = await UserModel.createOrUpdate(req.userId, req.userEmail);
      const filePath = req.file.path;

      logger.info(`Receipt uploaded: ${req.file.filename} by user ${user.id}`);

      // Validate image
      const validation = await FileUtils.validateImage(filePath);
      if (!validation.valid) {
        await FileUtils.deleteFile(filePath);
        return res.status(400).json({
          success: false,
          error: 'Invalid image file'
        });
      }

      // Optimize image
      const optimizedPath = path.join(
        path.dirname(filePath),
        'optimized_' + path.basename(filePath)
      );

      await FileUtils.optimizeImage(filePath, optimizedPath);

      let ocrResult = null;
      let extractedData = null;

      try {
        // Process with OCR
        logger.info(`Processing OCR for file: ${optimizedPath}`);
        ocrResult = await ocrService.processReceiptImage(optimizedPath);
        extractedData = ocrService.validateExtractedData(ocrResult);

        logger.info('OCR processing completed successfully');
      } catch (ocrError) {
        logger.error('OCR processing failed:', ocrError);
        // Continue without OCR data
      }

      // Create expense entry
      const expenseData = {
        category_id: 1, // Default to groceries category
        title: 'Receipt Upload',
        description: 'Uploaded receipt pending processing',
        total_amount: extractedData?.total_amount || 0,
        tax_amount: extractedData?.tax_amount || 0,
        expense_date: extractedData?.expense_date || new Date().toISOString().split('T')[0],
        receipt_image_path: optimizedPath,
        receipt_parsed: !!ocrResult?.success,
        is_grocery: true
      };

      // Handle supermarket
      if (extractedData?.merchant_name) {
        const supermarket = await SupermarketModel.getOrCreate(extractedData.merchant_name);
        expenseData.supermarket_id = supermarket.id;
        expenseData.title = `${supermarket.name} - Receipt`;
      }

      const expense = await ExpenseModel.create(user.id, expenseData);

      // Create grocery items if OCR was successful
      if (extractedData?.items && extractedData.items.length > 0) {
        await GroceryItemModel.createBulk(expense.id, extractedData.items);
      }

      // Clean up original file
      await FileUtils.deleteFile(filePath);

      // Get complete expense data with grocery items
      const completeExpense = await ExpenseModel.getById(expense.id);
      if (completeExpense.is_grocery) {
        completeExpense.grocery_items = await GroceryItemModel.getByExpenseId(expense.id);
      }

      res.status(201).json({
        success: true,
        data: {
          expense: completeExpense,
          ocr_processed: !!ocrResult?.success,
          items_found: extractedData?.items?.length || 0
        }
      });

    } catch (error) {
      logger.error('Error uploading receipt:', error);

      // Clean up uploaded file on error
      if (req.file && req.file.path) {
        await FileUtils.deleteFile(req.file.path);
      }

      next(error);
    }
  }

  // Get receipt image
  static async getReceiptImage(req, res, next) {
    try {
      const user = await UserModel.getByAuthId(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const expense = await ExpenseModel.getById(req.params.id);

      if (!expense) {
        return res.status(404).json({
          success: false,
          error: 'Expense not found'
        });
      }

      // Check if expense belongs to user
      if (expense.user_id !== user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      if (!expense.receipt_image_path || !fs.existsSync(expense.receipt_image_path)) {
        return res.status(404).json({
          success: false,
          error: 'Receipt image not found'
        });
      }

      // Generate thumbnail if requested
      if (req.query.thumbnail === 'true') {
        const thumbnailPath = path.join(
          path.dirname(expense.receipt_image_path),
          'thumb_' + path.basename(expense.receipt_image_path)
        );

        if (!fs.existsSync(thumbnailPath)) {
          await FileUtils.generateThumbnail(expense.receipt_image_path, thumbnailPath);
        }

        return res.sendFile(path.resolve(thumbnailPath));
      }

      res.sendFile(path.resolve(expense.receipt_image_path));
    } catch (error) {
      logger.error('Error getting receipt image:', error);
      next(error);
    }
  }

  // Delete receipt image
  static async deleteReceiptImage(req, res, next) {
    try {
      const user = await UserModel.getByAuthId(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const expense = await ExpenseModel.getById(req.params.id);

      if (!expense) {
        return res.status(404).json({
          success: false,
          error: 'Expense not found'
        });
      }

      // Check if expense belongs to user
      if (expense.user_id !== user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      if (expense.receipt_image_path) {
        await FileUtils.deleteFile(expense.receipt_image_path);

        // Update expense to remove image path
        await ExpenseModel.update(expense.id, user.id, {
          receipt_image_path: null,
          receipt_parsed: false
        });
      }

      res.json({
        success: true,
        message: 'Receipt image deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting receipt image:', error);
      next(error);
    }
  }
}


export default UploadController;
