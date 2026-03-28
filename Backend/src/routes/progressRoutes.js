import express from 'express';
import {
  updateProgress,
  getStudentProgress,
  getAllProgress,
  getCourseProgressStats,
  checkLessonCompletion,
} from '../controllers/progressController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Tất cả routes cần xác thực
router.use(authMiddleware);

// Student routes
router.post('/', updateProgress);
router.get('/course/:courseId', getStudentProgress);
router.get('/my-progress', getAllProgress);
router.get('/check/lesson', checkLessonCompletion); // Phải đặt trước router

// Instructor/Admin routes
router.get('/stats/:courseId', getCourseProgressStats);

export default router;
