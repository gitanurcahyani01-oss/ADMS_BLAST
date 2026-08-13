import express from 'express';
import { createOrder, getInvoice } from '../controllers/orderController.js';

const router = express.Router();

// Public Checkout & Invoice endpoints
router.post('/checkout', createOrder);
router.get('/invoice/:invoiceNumber', getInvoice);

export default router;
