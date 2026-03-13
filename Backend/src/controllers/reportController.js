import pool from '../config/database.js';
import Course from '../models/Course.js';

// THỐNG KÊ TỔNG QUAN (cho admin)
export const getSystemStatistics = async (req, res) => {
  try {
    // Tổng số users
    const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersCount.rows[0].count, 10);

    // Số students
    const studentsCount = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'student'"
    );
    const totalStudents = parseInt(studentsCount.rows[0].count, 10);

    // Số instructors
    const instructorsCount = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'instructor'"
    );
    const totalInstructors = parseInt(instructorsCount.rows[0].count, 10);

    // Tổng số courses
    const coursesCount = await pool.query('SELECT COUNT(*) as count FROM courses');
    const totalCourses = parseInt(coursesCount.rows[0].count, 10);

    // Tổng số lessons
    const lessonsCount = await pool.query('SELECT COUNT(*) as count FROM lessons');
    const totalLessons = parseInt(lessonsCount.rows[0].count, 10);

    // Tổng số enrollments
    const enrollmentsCount = await pool.query('SELECT COUNT(*) as count FROM enrollments');
    const totalEnrollments = parseInt(enrollmentsCount.rows[0].count, 10);

    res.json({
      statistics: {
        users: {
          total: totalUsers,
          students: totalStudents,
          instructors: totalInstructors,
        },
        content: {
          courses: totalCourses,
          lessons: totalLessons,
        },
        engagement: {
          enrollments: totalEnrollments,
        },
      },
    });
  } catch (error) {
    console.error('Get system statistics error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// THỐNG KÊ KHÓA HỌC (cho instructor/admin)
export const getCourseStatistics = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Kiểm tra quyền
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Khóa học không tồn tại' });
    }

    if (req.user.role !== 'admin' && req.user.id !== course.instructor_id) {
      return res.status(403).json({ error: 'Không có quyền xem thống kê' });
    }

    // Số sinh viên đã enroll
    const enrollmentsQuery = await pool.query(
      'SELECT COUNT(*) as count FROM enrollments WHERE course_id = $1',
      [courseId]
    );
    const totalEnrollments = parseInt(enrollmentsQuery.rows[0].count, 10);

    // Số sinh viên đã hoàn thành
    const completedQuery = await pool.query(
      `SELECT COUNT(DISTINCT e.user_id) as count
       FROM enrollments e
       WHERE e.course_id = $1 AND e.status = 'completed'`,
      [courseId]
    );
    const completedStudents = parseInt(completedQuery.rows[0].count, 10);

    // Số chứng chỉ đã cấp
    const certificatesQuery = await pool.query(
      'SELECT COUNT(*) as count FROM certificates WHERE course_id = $1',
      [courseId]
    );
    const certificatesIssued = parseInt(certificatesQuery.rows[0].count, 10);

    // Tỷ lệ hoàn thành
    const completionRate =
      totalEnrollments > 0
        ? ((completedStudents / totalEnrollments) * 100).toFixed(2)
        : 0;

    // Tiến độ trung bình
    const progressQuery = await pool.query(
      `SELECT ROUND(AVG(
        (SELECT COUNT(CASE WHEN p.completed = true THEN 1 END)::float / 
                NULLIF(COUNT(l.id), 0) * 100
         FROM lessons l
         LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = e.user_id
         WHERE l.course_id = e.course_id)
       ), 2) as avg_progress
       FROM enrollments e
       WHERE e.course_id = $1`,
      [courseId]
    );
    const averageProgress = progressQuery.rows[0]?.avg_progress || 0;

    // Số bài học
    const lessonsQuery = await pool.query(
      'SELECT COUNT(*) as count FROM lessons WHERE course_id = $1',
      [courseId]
    );
    const totalLessons = parseInt(lessonsQuery.rows[0].count, 10);

    res.json({
      course: {
        id: course.id,
        title: course.title,
      },
      statistics: {
        enrollment: {
          total: totalEnrollments,
          completed: completedStudents,
          completionRate: `${completionRate}%`,
        },
        engagement: {
          averageProgress: `${averageProgress}%`,
        },
        content: {
          totalLessons: totalLessons,
        },
      },
    });
  } catch (error) {
    console.error('Get course statistics error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// THỐNG KÊ SINH VIÊN (cho instructor/admin)
export const getStudentStatistics = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Kiểm tra quyền
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Khóa học không tồn tại' });
    }

    if (req.user.role !== 'admin' && req.user.id !== course.instructor_id) {
      return res.status(403).json({ error: 'Không có quyền xem thống kê' });
    }

    // Danh sách sinh viên và tiến độ
    const studentsQuery = await pool.query(
      `SELECT 
        u.id, u.full_name, u.email,
        e.enrolled_at, e.status,
        COUNT(l.id) as total_lessons,
        COUNT(CASE WHEN p.completed = true THEN 1 END) as completed_lessons,
        ROUND((COUNT(CASE WHEN p.completed = true THEN 1 END)::float / 
               NULLIF(COUNT(l.id), 0) * 100), 2) as progress_percentage
       FROM enrollments e
       JOIN users u ON e.user_id = u.id
       LEFT JOIN lessons l ON e.course_id = l.course_id
       LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = e.user_id
       WHERE e.course_id = $1
       GROUP BY u.id, e.enrolled_at, e.status
       ORDER BY e.enrolled_at DESC`,
      [courseId]
    );

    const students = studentsQuery.rows;

    res.json({
      course: {
        id: course.id,
        title: course.title,
      },
      data: students,
      totalStudents: students.length,
    });
  } catch (error) {
    console.error('Get student statistics error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// THỐNG KÊ INSTRUCTOR (cho admin)
export const getInstructorStatistics = async (req, res) => {
  try {
    const { instructorId } = req.params;

    // Danh sách khóa học
    const coursesQuery = await pool.query(
      `SELECT 
        c.id, c.title,
        COUNT(DISTINCT e.user_id) as total_students,
        COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed_students,
        ROUND((COUNT(CASE WHEN e.status = 'completed' THEN 1 END)::float / 
               NULLIF(COUNT(DISTINCT e.user_id), 0) * 100), 2) as completion_rate
       FROM courses c
       LEFT JOIN enrollments e ON c.id = e.course_id
       WHERE c.instructor_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [instructorId]
    );

    const courses = coursesQuery.rows;

    // Tính tổng
    const totalStudents = courses.reduce((sum, course) => sum + course.total_students, 0);

    res.json({
      instructor: {
        id: instructorId,
      },
      statistics: {
        totalCourses: courses.length,
        totalStudents: totalStudents,
      },
      courses: courses,
    });
  } catch (error) {
    console.error('Get instructor statistics error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// TOP COURSES (courses phổ biến nhất)
export const getTopCourses = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topCoursesQuery = await pool.query(
      `SELECT 
        c.id, c.title, c.description,
        u.full_name as instructor_name,
        COUNT(DISTINCT e.user_id) as student_count,
        COUNT(DISTINCT cert.id) as certificates_issued,
        ROUND(AVG(CASE 
          WHEN COUNT(l.id) > 0 THEN (COUNT(CASE WHEN p.completed = true THEN 1 END)::float / COUNT(l.id) * 100)
          ELSE 0
        END), 2) as avg_completion_rate
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       LEFT JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN certificates cert ON c.id = cert.course_id
       LEFT JOIN lessons l ON c.id = l.course_id
       LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = e.user_id
       GROUP BY c.id, u.full_name
       ORDER BY student_count DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      data: topCoursesQuery.rows,
    });
  } catch (error) {
    console.error('Get top courses error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// REPORTS: Xuất báo cáo theo tháng
export const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: 'Vui lòng cung cấp year và month' });
    }

    // Enrollments trong tháng
    const enrollmentsQuery = await pool.query(
      `SELECT 
        COUNT(*) as new_enrollments,
        COUNT(DISTINCT user_id) as new_students,
        COUNT(DISTINCT course_id) as courses_involved
       FROM enrollments
       WHERE EXTRACT(YEAR FROM enrolled_at) = $1 
       AND EXTRACT(MONTH FROM enrolled_at) = $2`,
      [year, month]
    );

    // Certificates issued trong tháng
    const certificatesQuery = await pool.query(
      `SELECT COUNT(*) as count
       FROM certificates
       WHERE EXTRACT(YEAR FROM issued_at) = $1 
       AND EXTRACT(MONTH FROM issued_at) = $2`,
      [year, month]
    );

    const newUsers = await pool.query(
      `SELECT COUNT(*) as count
       FROM users
       WHERE EXTRACT(YEAR FROM created_at) = $1 
       AND EXTRACT(MONTH FROM created_at) = $2`,
      [year, month]
    );

    res.json({
      period: `${month}/${year}`,
      report: {
        newUsers: parseInt(newUsers.rows[0].count, 10),
        newEnrollments: parseInt(enrollmentsQuery.rows[0].new_enrollments, 10),
        newStudents: parseInt(enrollmentsQuery.rows[0].new_students, 10),
        coursesInvolved: parseInt(enrollmentsQuery.rows[0].courses_involved, 10),
        certificatesIssued: parseInt(certificatesQuery.rows[0].count, 10),
      },
    });
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};
