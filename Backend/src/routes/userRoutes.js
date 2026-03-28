import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  resetPassword,
  updateProfile,
  requestPasswordReset,
  createUser,
} from '../controllers/userController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/forgot-password', requestPasswordReset);

// Tất cả routes sau cần xác thực
router.use(authMiddleware);

// User tự cập nhật profile
router.put('/profile/update', updateProfile);

// Public routes (user tự view/update profile mình)
router.get('/:id', getUserById);
router.put('/:id', updateUser);

// Admin only
router.post('/', adminMiddleware, createUser); 
router.get('/', adminMiddleware, getAllUsers);
router.delete('/:id', adminMiddleware, deleteUser);
router.post('/:id/reset-password', adminMiddleware, resetPassword);

export default router;
