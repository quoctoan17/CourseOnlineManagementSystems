import express from 'express';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  getCourseBySlug,
  getInstructorCourses,
  getCoursesByCategory,
  updateCourse,
  deleteCourse,
  updateCourseStatus,
} from '../controllers/courseController.js';
import { authMiddleware, instructorMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllCourses);
router.get('/by-category/:categoryId', getCoursesByCategory);
router.get('/category/:categoryId', getCoursesByCategory);
router.get('/slug/:slug', getCourseBySlug); 
router.get('/:id', getCourseById);

// Instructor/Admin routes
router.post('/', authMiddleware, instructorMiddleware, createCourse);
router.get('/instructor/my-courses', authMiddleware, instructorMiddleware, getInstructorCourses);
router.put('/:id', authMiddleware, instructorMiddleware, updateCourse);
router.patch('/:id/status', authMiddleware, instructorMiddleware, updateCourseStatus);
router.delete('/:id', authMiddleware, instructorMiddleware, deleteCourse);

export default router;