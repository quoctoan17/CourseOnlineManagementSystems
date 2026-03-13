import Progress from '../models/Progress.js';
import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';

// CẬP NHẬT/TẠO PROGRESS
export const updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonId, completed } = req.body;

    if (!lessonId || completed === undefined) {
      return res.status(400).json({ error: 'Vui lòng cung cấp lessonId và completed' });
    }

    // Kiểm tra lesson tồn tại
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Bài học không tồn tại' });
    }

    const progress = await Progress.upsert(userId, lessonId, completed);

    res.json({
      message: 'Cập nhật tiến độ thành công',
      progress,
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

    // Kiểm tra khóa học tồn tại
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Khóa học không tồn tại' });
    }

    const progress = await Progress.findStudentProgress(userId, courseId);
    const progressPercentage = await Progress.getStudentProgressPercentage(userId, courseId);

    res.json({
      course: {
        id: course.id,
        title: course.title,
      },
      lessons: progress,
      summary: {
        totalLessons: progressPercentage?.total_lessons || 0,
        completedLessons: progressPercentage?.completed_lessons || 0,
        progressPercentage: progressPercentage?.progress_percentage || 0,
      },
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

    res.json({
      data: allProgress,
    });
  } catch (error) {
    console.error('Get all progress error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// LẤY THỐNG KÊ TIẾN ĐỘ CỦA LỚP (instructor/admin)
export const getCourseProgressStats = async (req, res) => {
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

    // Lấy danh sách sinh viên và tiến độ của họ
    const students = await Progress.findStudentProgress(null, courseId); // Placeholder, cần khác

    res.json({
      course: {
        id: course.id,
        title: course.title,
      },
      statistics: {
        totalStudents: students.length,
        completionRate: 0, // Cần tính toán
      },
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

    if (!lessonId) {
      return res.status(400).json({ error: 'Vui lòng cung cấp lessonId' });
    }

    const progress = await Progress.findByUserAndLesson(userId, lessonId);

    res.json({
      completed: progress?.completed || false,
      progress: progress || null,
    });
  } catch (error) {
    console.error('Check lesson completion error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};
