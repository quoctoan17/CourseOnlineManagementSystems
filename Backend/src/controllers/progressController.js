import Progress from '../models/Progress.js';
import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';
import Certificate from '../models/Certificate.js';
import pool from '../config/database.js';

// ─── helper: kiểm tra và cấp chứng chỉ nếu hoàn thành 100% ─────────────────
const tryIssueCertificate = async (userId, courseId) => {
  const pct = await Progress.getStudentProgressPercentage(userId, courseId);
  const percent = parseFloat(pct?.progress_percentage || 0);
  if (percent < 100) return null;

  // Lấy tên student và course để snapshot vào chứng chỉ
  const userRes = await pool.query('SELECT full_name FROM users WHERE id = $1', [userId]);
  const courseRes = await pool.query('SELECT title FROM courses WHERE id = $1', [courseId]);
  const studentName = userRes.rows[0]?.full_name || '';
  const courseTitle = courseRes.rows[0]?.title || '';

  // Cấp chứng chỉ (upsert — không cấp lại nếu đã có)
  const cert = await Certificate.issue(userId, courseId, studentName, courseTitle);

  // Đánh dấu enrollment đã hoàn thành
  await pool.query(
    `UPDATE enrollments 
     SET status = 'completed', completed_at = NOW(), has_new_lessons = FALSE
     WHERE user_id = $1 AND course_id = $2`,
    [userId, courseId]
  );

  return cert;
};

// CẬP NHẬT/TẠO PROGRESS
export const updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonId, completed } = req.body;

    if (!lessonId || completed === undefined) {
      return res.status(400).json({ error: 'Vui lòng cung cấp lessonId và completed' });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ error: 'Bài học không tồn tại' });

    const progress = await Progress.upsert(userId, lessonId, completed);

    // Nếu vừa đánh dấu hoàn thành → thử cấp chứng chỉ
    let certificate = null;
    if (completed) {
      certificate = await tryIssueCertificate(userId, lesson.course_id);
    }

    res.json({
      message: 'Cập nhật tiến độ thành công',
      progress,
      // Nếu certificate !== null → vừa được cấp chứng chỉ, FE có thể hiện popup
      certificate: certificate || null,
      course_completed: !!certificate,
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// LẤY TIẾN ĐỘ CỦA SINH VIÊN TRONG KHÓA HỌC
export const getStudentProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Khóa học không tồn tại' });

    const progress = await Progress.findStudentProgress(userId, courseId);
    const progressPercentage = await Progress.getStudentProgressPercentage(userId, courseId);

    // Kiểm tra có lesson mới sau khi hoàn thành không
    const enrollRes = await pool.query(
      'SELECT has_new_lessons, completed_at FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );
    const enrollment = enrollRes.rows[0];

    // Kiểm tra chứng chỉ hiện có
    const certificate = await Certificate.findByUserAndCourse(userId, courseId);

    res.json({
      course: { id: course.id, title: course.title },
      lessons: progress,
      summary: {
        totalLessons: progressPercentage?.total_lessons || 0,
        completedLessons: progressPercentage?.completed_lessons || 0,
        progressPercentage: progressPercentage?.progress_percentage || 0,
      },
      certificate: certificate || null,
      // Flag để FE hiện banner "Có nội dung mới"
      has_new_lessons: enrollment?.has_new_lessons || false,
      completed_at: enrollment?.completed_at || null,
    });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// LẤY TẤT CẢ TIẾN ĐỘ CỦA SINH VIÊN
export const getAllProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const allProgress = await Progress.findByUser(userId);
    res.json({ data: allProgress });
  } catch (error) {
    console.error('Get all progress error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// LẤY THỐNG KÊ TIẾN ĐỘ CỦA LỚP (instructor/admin)
export const getCourseProgressStats = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Khóa học không tồn tại' });
    if (req.user.role !== 'admin' && req.user.id !== course.instructor_id)
      return res.status(403).json({ error: 'Không có quyền xem thống kê' });

    const students = await Progress.findStudentProgress(null, courseId);
    res.json({
      course: { id: course.id, title: course.title },
      statistics: { totalStudents: students.length, completionRate: 0 },
    });
  } catch (error) {
    console.error('Get course progress stats error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// KIỂM TRA HOÀN THÀNH BÀI HỌC
export const checkLessonCompletion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonId } = req.query;
    if (!lessonId) return res.status(400).json({ error: 'Vui lòng cung cấp lessonId' });
    const progress = await Progress.findByUserAndLesson(userId, lessonId);
    res.json({ completed: progress?.completed || false, progress: progress || null });
  } catch (error) {
    console.error('Check lesson completion error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};