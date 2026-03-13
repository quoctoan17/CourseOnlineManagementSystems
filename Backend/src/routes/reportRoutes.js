import express from 'express';
import {
  getSystemStatistics,
  getCourseStatistics,
  getStudentStatistics,
  getInstructorStatistics,
  getTopCourses,
  getMonthlyReport,
} from '../controllers/reportController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Admin only routes
router.get('/system/statistics', authMiddleware, adminMiddleware, getSystemStatistics);
router.get('/top-courses', authMiddleware, adminMiddleware, getTopCourses);
router.get('/monthly/:year/:month', authMiddleware, adminMiddleware, getMonthlyReport);

// Instructor/Admin routes
router.get('/course/:courseId/statistics', authMiddleware, getCourseStatistics);
router.get('/course/:courseId/students', authMiddleware, getStudentStatistics);

// Instructor statistics (for their own courses)
router.get('/instructor/:instructorId/statistics', authMiddleware, getInstructorStatistics);

export default router;
