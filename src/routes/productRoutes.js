import express from 'express';
import ProductModel from '../models/Product.js';

const router = express.Router();

// GET /api/products - List all products
router.get('/', async (req, res, next) => {
  try {
    const products = await ProductModel.getAll();
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', async (req, res, next) => {
  try {
    const product = await ProductModel.getById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// POST /api/products - Create new product
router.post('/', async (req, res, next) => {
  try {
    const product = await ProductModel.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res, next) => {
  try {
    const product = await ProductModel.update(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', async (req, res, next) => {
  try {
    await ProductModel.delete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
