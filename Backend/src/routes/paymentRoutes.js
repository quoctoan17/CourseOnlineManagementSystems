import express from 'express';
import { createPayment, confirmPayment } from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.post('/', createPayment);
router.post('/confirm', confirmPayment);

export default router;