import Payment from '../models/Payment.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

// ─── helper ──────────────────────────────────────────────────────────────────
const assertCoursePayable = async (courseId) => {
  const course = await Course.findById(courseId);
  if (!course) throw { status: 404, message: 'Khóa học không tồn tại' };
  if (course.status === 'archived')
    throw { status: 403, message: 'Khóa học đã ngưng xuất bản, không thể thanh toán' };
  if (course.status !== 'published')
    throw { status: 403, message: 'Khóa học này chưa được công bố, không thể thanh toán' };
  return course;
};

// Tạo payment (pending)
export const createPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { course_id } = req.body;
    if (!course_id) return res.status(400).json({ error: 'Thiếu course_id' });

    const course = await assertCoursePayable(course_id);

    const existing = await Enrollment.findByUserAndCourse(userId, course_id);
    if (existing) return res.status(400).json({ error: 'Bạn đã đăng ký khóa học này rồi' });

    const paid = await Payment.findByUserAndCourse(userId, course_id);
    if (paid) return res.status(400).json({ error: 'Bạn đã thanh toán khóa học này rồi' });

    const payment = await Payment.create(userId, course_id, course.price);
    res.status(201).json({
      message: 'Tạo payment thành công',
      payment: { id: payment.id, course_id: payment.course_id, amount: payment.amount, status: payment.status },
    });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Xác nhận thanh toán → enroll luôn
export const confirmPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { payment_id } = req.body;

    const payment = await Payment.findById(payment_id);
    if (!payment) return res.status(404).json({ error: 'Payment không tồn tại' });
    if (payment.user_id !== userId) return res.status(403).json({ error: 'Không có quyền' });
    if (payment.status === 'success') return res.status(400).json({ error: 'Payment đã được xác nhận' });

    await Payment.updateStatus(payment.id, 'success');

    const existing = await Enrollment.findByUserAndCourse(userId, payment.course_id);
    if (!existing) await Enrollment.create(userId, payment.course_id);

    res.json({ message: 'Thanh toán thành công', course_id: payment.course_id });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};