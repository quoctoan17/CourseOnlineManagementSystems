import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

// ĐĂNG KÝ KHÓA HỌC
export const enrollCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.body.courseId ?? req.body.course_id;

    if (!courseId) {
      return res.status(400).json({ error: 'Vui lòng cung cấp courseId' });
    }

    // Kiểm tra khóa học tồn tại
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Khóa học không tồn tại' });
    }

    // Kiểm tra đã đăng ký chưa
    const existingEnrollment = await Enrollment.findByUserAndCourse(userId, courseId);
    if (existingEnrollment) {
      return res.status(400).json({ error: 'Bạn đã đăng ký khóa học này rồi' });
    }

    const enrollment = await Enrollment.create(userId, courseId);

    res.status(201).json({
      message: 'Đăng ký khóa học thành công',
      enrollment,
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// LẤY DANH SÁCH KHÓA HỌC CỦA SINH VIÊN
export const getMyEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const courses = await Enrollment.findStudentCourses(userId, limit, offset);
    const total = await Enrollment.countByUser(userId);
    const totalPages = Math.ceil(total / limit) || 1;

    res.json({
      data: courses,
      totalPages,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// LẤY DANH SÁCH SINH VIÊN CỦA KHÓA HỌC (instructor/admin)
export const getEnrolledStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Kiểm tra quyền
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Khóa học không tồn tại' });
    }

    if (req.user.role !== 'admin' && req.user.id !== course.instructor_id) {
      return res.status(403).json({ error: 'Không có quyền xem danh sách sinh viên' });
    }

    const students = await Enrollment.findCourseStudents(courseId, limit, offset);

    res.json({
      data: students,
      pagination: {
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Get enrolled students error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// HỦY ĐĂNG KÝ KHÓA HỌC
export const unenrollCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const enrollment = await Enrollment.findByUserAndCourse(userId, courseId);
    if (!enrollment) {
      return res.status(404).json({ error: 'Bạn chưa đăng ký khóa học này' });
    }

    await Enrollment.delete(enrollment.id);

    res.json({ message: 'Hủy đăng ký thành công' });
  } catch (error) {
    console.error('Unenroll course error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// CẬP NHẬT STATUS ENROLLMENT (hoàn thành/đang học) - theo enrollmentId
export const updateEnrollmentStatus = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { status } = req.body;

    if (!['active', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Status không hợp lệ' });
    }

    const updatedEnrollment = await Enrollment.updateStatus(enrollmentId, status);

    res.json({
      message: 'Cập nhật trạng thái thành công',
      enrollment: updatedEnrollment,
    });
  } catch (error) {
    console.error('Update enrollment status error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// CẬP NHẬT STATUS ENROLLMENT - theo courseId (cho student tự cập nhật)
export const updateEnrollmentStatusByCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;
    const { status } = req.body;

    if (!['active', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Status không hợp lệ' });
    }

    const enrollment = await Enrollment.findByUserAndCourse(userId, courseId);
    if (!enrollment) {
      return res.status(404).json({ error: 'Bạn chưa đăng ký khóa học này' });
    }

    const updatedEnrollment = await Enrollment.updateStatus(enrollment.id, status);

    res.json({
      message: 'Cập nhật trạng thái thành công',
      enrollment: updatedEnrollment,
    });
  } catch (error) {
    console.error('Update enrollment status by course error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// KIỂM TRA ĐĂNG KÝ
// enrollmentController.js
export const checkEnrollment = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId ?? req.query.courseId;

    if (!courseId) {
      return res.status(400).json({ error: 'Vui lòng cung cấp courseId' });
    }

    const enrollment = await Enrollment.findByUserAndCourse(userId, courseId);

    res.json({
      is_enrolled: !!enrollment,  // ← đổi "enrolled" thành "is_enrolled"
      enrollment: enrollment || null,
    });
  } catch (error) {
    console.error('Check enrollment error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};