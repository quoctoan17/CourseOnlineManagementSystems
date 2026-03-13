import express from 'express';
import { 
  register, 
  login, 
  getMe,
  checkEmailForReset,
  resetPasswordByEmail
} from '../controllers/authController.js';

import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// ===== FORGOT PASSWORD =====
router.post('/check-email', checkEmailForReset);
router.post('/reset-password', resetPasswordByEmail);

// ===== PUBLIC =====
router.post('/register', register);
router.post('/login', login);

// ===== PROTECTED =====
router.get('/me', authMiddleware, getMe);


export default router;
