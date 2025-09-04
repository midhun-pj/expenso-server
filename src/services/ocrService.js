import axios from 'axios';
import logger from '../utils/logger';

class OCRService {
  constructor() {
    this.apiUrl = process.env.OCR_API_URL || 'https://ocr.asprise.com/api/v1/receipt';
    this.apiKey = process.env.OCR_API_KEY || 'TEST';
  }

  // Process receipt image using OCR
  async processReceiptImage(imagePath) {
    try {
      const FormData = require('form-data');
      const fs = require('fs');

      const form = new FormData();
      form.append('api_key', this.apiKey);
      form.append('recognizer', 'auto');
      form.append('ref_no', `receipt_${Date.now()}`);
      form.append('file', fs.createReadStream(imagePath));

      const response = await axios.post(this.apiUrl, form, {
        headers: {
          ...form.getHeaders(),
        },
        timeout: 30000, // 30 seconds timeout
      });

      return this.parseOCRResponse(response.data);
    } catch (error) {
      logger.error('Error processing receipt with OCR:', error);
      throw new Error('Failed to process receipt image');
    }
  }

  // Parse OCR response and extract structured data
  parseOCRResponse(ocrData) {
    try {
      const result = {
        success: false,
        merchant: null,
        total: null,
        tax: null,
        date: null,
        items: [],
        raw_data: ocrData
      };

      if (!ocrData.receipts || ocrData.receipts.length === 0) {
        return result;
      }

      const receipt = ocrData.receipts[0];
      result.success = true;

      // Extract merchant information
      if (receipt.merchant_name) {
        result.merchant = {
          name: receipt.merchant_name,
          address: receipt.merchant_address || null,
          phone: receipt.merchant_phone || null
        };
      }

      // Extract totals
      result.total = receipt.total ? parseFloat(receipt.total) : null;
      result.tax = receipt.tax ? parseFloat(receipt.tax) : null;

      // Extract date
      if (receipt.date) {
        result.date = this.parseReceiptDate(receipt.date);
      }

      // Extract line items
      if (receipt.items && Array.isArray(receipt.items)) {
        result.items = receipt.items.map(item => ({
          description: item.description || '',
          quantity: item.qty ? parseFloat(item.qty) : 1,
          unit_price: item.unitPrice ? parseFloat(item.unitPrice) : null,
          total_price: item.amount ? parseFloat(item.amount) : null,
          category: this.categorizeGroceryItem(item.description || '')
        })).filter(item => item.description.trim() !== '');
      }

      return result;
    } catch (error) {
      logger.error('Error parsing OCR response:', error);
      return {
        success: false,
        error: 'Failed to parse OCR response',
        raw_data: ocrData
      };
    }
  }

  // Parse various date formats from receipts
  parseReceiptDate(dateString) {
    try {
      // Common receipt date formats
      const dateFormats = [
        // MM/DD/YYYY
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
        // DD/MM/YYYY
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
        // YYYY-MM-DD
        /(\d{4})-(\d{1,2})-(\d{1,2})/,
        // DD-MM-YYYY
        /(\d{1,2})-(\d{1,2})-(\d{4})/
      ];

      for (const format of dateFormats) {
        const match = dateString.match(format);
        if (match) {
          const date = new Date(match[0]);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
          }
        }
      }

      // If no format matches, try parsing directly
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }

      return null;
    } catch (error) {
      logger.warn('Could not parse receipt date:', dateString);
      return null;
    }
  }

  // Categorize grocery items based on description
  categorizeGroceryItem(description) {
    const categories = {
      'produce': ['apple', 'banana', 'orange', 'tomato', 'lettuce', 'carrot', 'onion', 'potato', 'fruit', 'vegetable'],
      'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg'],
      'meat': ['chicken', 'beef', 'pork', 'fish', 'turkey', 'ham', 'bacon'],
      'bakery': ['bread', 'bagel', 'cake', 'cookie', 'muffin', 'croissant'],
      'beverages': ['water', 'soda', 'juice', 'coffee', 'tea', 'beer', 'wine'],
      'frozen': ['frozen', 'ice cream', 'pizza'],
      'pantry': ['rice', 'pasta', 'cereal', 'flour', 'sugar', 'oil', 'sauce', 'spice'],
      'household': ['soap', 'detergent', 'shampoo', 'toothpaste', 'tissue', 'paper towel'],
      'snacks': ['chips', 'candy', 'nuts', 'crackers', 'chocolate']
    };

    const lowerDesc = description.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
      for (const keyword of keywords) {
        if (lowerDesc.includes(keyword)) {
          return category;
        }
      }
    }

    return 'other';
  }

  // Validate and clean extracted data
  validateExtractedData(data) {
    const cleaned = {
      merchant_name: null,
      total_amount: null,
      tax_amount: null,
      expense_date: null,
      items: []
    };

    if (data.merchant && data.merchant.name) {
      cleaned.merchant_name = data.merchant.name.trim();
    }

    if (data.total && !isNaN(data.total) && data.total > 0) {
      cleaned.total_amount = parseFloat(data.total.toFixed(2));
    }

    if (data.tax && !isNaN(data.tax) && data.tax >= 0) {
      cleaned.tax_amount = parseFloat(data.tax.toFixed(2));
    }

    if (data.date) {
      cleaned.expense_date = data.date;
    } else {
      // Default to today if no date found
      cleaned.expense_date = new Date().toISOString().split('T')[0];
    }

    // Clean and validate items
    if (data.items && Array.isArray(data.items)) {
      cleaned.items = data.items
        .filter(item => item.description && item.description.trim() !== '')
        .map(item => ({
          item_name: item.description.trim(),
          quantity: item.quantity && !isNaN(item.quantity) ? parseFloat(item.quantity) : 1,
          unit_price: item.unit_price && !isNaN(item.unit_price) ? parseFloat(item.unit_price.toFixed(2)) : null,
          total_price: item.total_price && !isNaN(item.total_price) ? parseFloat(item.total_price.toFixed(2)) : null,
          category: item.category || 'other'
        }))
        .filter(item => item.total_price !== null && item.total_price > 0);
    }

    return cleaned;
  }
}


const ocr = new OCRService();

export default ocr;