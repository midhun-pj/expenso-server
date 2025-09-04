import express from 'express';
import CurrencyModel from '../models/Currency.js';

const router = express.Router();

// GET /api/currencies - List all currencies
router.get('/', async (req, res, next) => {
  try {
    const currencies = await CurrencyModel.getAll();
    res.json({ success: true, data: currencies });
  } catch (error) {
    next(error);
  }
});

// GET /api/currencies/:id - Get currency by ID
router.get('/:id', async (req, res, next) => {
  try {
    const currency = await CurrencyModel.getById(req.params.id);
    if (!currency) return res.status(404).json({ success: false, error: 'Currency not found' });
    res.json({ success: true, data: currency });
  } catch (error) {
    next(error);
  }
});

// POST /api/currencies - Create new currency
router.post('/', async (req, res, next) => {
  try {
    const currency = await CurrencyModel.create(req.body);
    res.status(201).json({ success: true, data: currency });
  } catch (error) {
    next(error);
  }
});

// PUT /api/currencies/:id - Update currency
router.put('/:id', async (req, res, next) => {
  try {
    const currency = await CurrencyModel.update(req.params.id, req.body);
    res.json({ success: true, data: currency });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/currencies/:id - Delete currency
router.delete('/:id', async (req, res, next) => {
  try {
    await CurrencyModel.delete(req.params.id);
    res.json({ success: true, message: 'Currency deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
