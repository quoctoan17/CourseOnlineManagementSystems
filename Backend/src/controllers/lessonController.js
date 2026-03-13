import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';

// TẠO LESSON MỚI
export const createLesson = async (req, res) => {
  try {
    const { courseId, title, videoUrl, lessonOrder } = req.body;

    if (!courseId || !title || lessonOrder === undefined) {
      return res.status(400).json({ error: 'Vui lòng điền đủ thông tin' });
    }

    // Kiểm tra quyền - instructor phải là chủ course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Khóa học không tồn tại' });
    }

    if (req.user.role !== 'admin' && req.user.id !== course.instructor_id) {
      return res.status(403).json({ error: 'Không có quyền tạo lesson trong khóa học này' });
    }

    const lesson = await Lesson.create(courseId, title, videoUrl || null, lessonOrder);

    res.status(201).json({
      message: 'Tạo bài học thành công',
      lesson,
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// LẤY TẤT CẢ LESSONS CỦA MỘT COURSE
export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Kiểm tra khóa học tồn tại
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Khóa học không tồn tại' });
    }

    const lessons = await Lesson.findByCourse(courseId);

    res.json({
      data: lessons,
      course: {
        id: course.id,
        title: course.title,
      },
    });
  } catch (error) {
    console.error('Get lessons by course error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// LẤY LESSON THEO ID
export const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ error: 'Bài học không tồn tại' });
    }

    res.json({ lesson });
  } catch (error) {
    console.error('Get lesson by id error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// CẬP NHẬT LESSON
export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, videoUrl, lessonOrder } = req.body;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ error: 'Bài học không tồn tại' });
    }

    // Kiểm tra quyền
    const course = await Course.findById(lesson.course_id);
    if (req.user.role !== 'admin' && req.user.id !== course.instructor_id) {
      return res.status(403).json({ error: 'Không có quyền cập nhật bài học này' });
    }

    if (!title || lessonOrder === undefined) {
      return res.status(400).json({ error: 'Vui lòng điền đủ thông tin' });
    }

    const updatedLesson = await Lesson.update(
      id,
      title,
      videoUrl || lesson.video_url,
      lessonOrder
    );

    res.json({
      message: 'Cập nhật bài học thành công',
      lesson: updatedLesson,
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// XÓA LESSON
export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ error: 'Bài học không tồn tại' });
    }

    // Kiểm tra quyền
    const course = await Course.findById(lesson.course_id);
    if (req.user.role !== 'admin' && req.user.id !== course.instructor_id) {
      return res.status(403).json({ error: 'Không có quyền xóa bài học này' });
    }

    await Lesson.delete(id);

    res.json({ message: 'Xóa bài học thành công' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// LẤY LESSON TIẾP THEO
export const getNextLesson = async (req, res) => {
  try {
    const { courseId, lessonOrder } = req.query;

    if (!courseId || lessonOrder === undefined) {
      return res.status(400).json({ error: 'Vui lòng cung cấp courseId và lessonOrder' });
    }

    const nextLesson = await Lesson.getNextLesson(courseId, lessonOrder);

    res.json({ lesson: nextLesson || null });
  } catch (error) {
    console.error('Get next lesson error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};
