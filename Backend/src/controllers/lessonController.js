import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';
import pool from '../config/database.js';

const countLessons = async (courseId) => {
  const result = await pool.query('SELECT COUNT(*) FROM lessons WHERE course_id = $1', [courseId]);
  return parseInt(result.rows[0].count, 10);
};

export const createLesson = async (req, res) => {
  try {
    const { courseId, title, videoUrl, lessonOrder, duration } = req.body;
    if (!courseId || !title || lessonOrder === undefined)
      return res.status(400).json({ error: 'Vui lòng điền đủ thông tin' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Khóa học không tồn tại' });
    if (req.user.role !== 'admin' && req.user.id !== course.instructor_id)
      return res.status(403).json({ error: 'Không có quyền tạo lesson trong khóa học này' });

    const lesson = await Lesson.create(courseId, title, videoUrl || null, lessonOrder, duration || null);

    // AUTO-PUBLISH
    let currentStatus = course.status;

    if (course.status === 'draft' || course.status === 'inactive') {
      await Course.updateStatus(courseId, 'published');
      currentStatus = 'published';
    }

    if (currentStatus === 'published') {
      await pool.query(
        `UPDATE enrollments SET has_new_lessons = TRUE
        WHERE course_id = $1 AND status = 'completed'`,
        [courseId]
      );
    }

    res.status(201).json({ message: 'Tạo bài học thành công', lesson, course_status: 'published' });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Khóa học không tồn tại' });
    const lessons = await Lesson.findByCourse(courseId);
    res.json({ data: lessons, course: { id: course.id, title: course.title } });
  } catch (error) {
    console.error('Get lessons by course error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

export const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findById(id);
    if (!lesson) return res.status(404).json({ error: 'Bài học không tồn tại' });
    res.json({ lesson });
  } catch (error) {
    console.error('Get lesson by id error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, videoUrl, lessonOrder, duration } = req.body;
    const lesson = await Lesson.findById(id);
    if (!lesson) return res.status(404).json({ error: 'Bài học không tồn tại' });
    const course = await Course.findById(lesson.course_id);
    if (req.user.role !== 'admin' && req.user.id !== course.instructor_id)
      return res.status(403).json({ error: 'Không có quyền cập nhật bài học này' });
    if (!title || lessonOrder === undefined)
      return res.status(400).json({ error: 'Vui lòng điền đủ thông tin' });
    const updatedLesson = await Lesson.update(
      id, title, videoUrl || lesson.video_url, lessonOrder,
      duration !== undefined ? duration : lesson.duration
    );
    res.json({ message: 'Cập nhật bài học thành công', lesson: updatedLesson });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findById(id);
    if (!lesson) return res.status(404).json({ error: 'Bài học không tồn tại' });
    const course = await Course.findById(lesson.course_id);
    if (req.user.role !== 'admin' && req.user.id !== course.instructor_id)
      return res.status(403).json({ error: 'Không có quyền xóa bài học này' });

    const currentCount = await countLessons(lesson.course_id);
    if (currentCount <= 1)
      return res.status(400).json({ error: 'Không thể xóa bài học cuối cùng. Khóa học phải có ít nhất 1 bài học.' });

    await Lesson.delete(id);
    res.json({ message: 'Xóa bài học thành công' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

export const getNextLesson = async (req, res) => {
  try {
    const { courseId, lessonOrder } = req.query;
    if (!courseId || lessonOrder === undefined)
      return res.status(400).json({ error: 'Vui lòng cung cấp courseId và lessonOrder' });
    const nextLesson = await Lesson.getNextLesson(courseId, lessonOrder);
    res.json({ lesson: nextLesson || null });
  } catch (error) {
    console.error('Get next lesson error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};