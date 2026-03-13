import express from 'express';
import {
  enrollCourse,
  getMyEnrolledCourses,
  getEnrolledStudents,
  unenrollCourse,
  updateEnrollmentStatusByCourse,
  checkEnrollment,
} from '../controllers/enrollmentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Tất cả routes cần xác thực
router.use(authMiddleware);

// Student routes
router.post('/', enrollCourse);
router.get('/my-courses', getMyEnrolledCourses);
router.delete('/:courseId', unenrollCourse);
router.get('/check/:courseId', checkEnrollment);
router.patch('/:courseId/status', updateEnrollmentStatusByCourse); // Student cập nhật trạng thái theo courseId

// Instructor/Admin routes
router.get('/course/:courseId/students', getEnrolledStudents);

export default router;
