import express from 'express';
import {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
  getNextLesson,
} from '../controllers/lessonController.js';
import { authMiddleware, instructorMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/course/:courseId', getLessonsByCourse);
router.get('/:id', getLessonById);
router.get('/page/next', getNextLesson); // Phải đặt trước /: id

// Instructor/Admin routes
router.post('/', authMiddleware, instructorMiddleware, createLesson);
router.put('/:id', authMiddleware, instructorMiddleware, updateLesson);
router.delete('/:id', authMiddleware, instructorMiddleware, deleteLesson);

export default router;
