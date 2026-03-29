import Certificate from '../models/Certificate.js';

// LẤY CHỨNG CHỈ CỦA STUDENT TRONG 1 COURSE
export const getCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const certificate = await Certificate.findByUserAndCourse(userId, courseId);
    if (!certificate) {
      return res.status(404).json({ error: 'Bạn chưa có chứng chỉ cho khóa học này' });
    }

    res.json({ certificate });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// LẤY TẤT CẢ CHỨNG CHỈ CỦA STUDENT
export const getMyCertificates = async (req, res) => {
  try {
    const userId = req.user.id;
    const certificates = await Certificate.findByUser(userId);
    res.json({ data: certificates });
  } catch (error) {
    console.error('Get my certificates error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};