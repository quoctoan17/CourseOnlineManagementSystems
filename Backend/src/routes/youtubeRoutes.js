// routes/youtubeRoutes.js
import express from 'express';
import { getVideoInfo } from '../controllers/youtubeController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.get('/video-info', authMiddleware, adminMiddleware, getVideoInfo);
export default router;