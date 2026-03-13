import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Tạo transport cho nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Gửi email đăng ký thành công
export const sendRegistrationEmail = async (email, fullName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@elearning.com',
      to: email,
      subject: '🎉 Chào mừng bạn tới EduLearn!',
      html: `
        <h1>Chào mừng ${fullName}!</h1>
        <p>Tài khoản của bạn đã được tạo thành công.</p>
        <p>Bây giờ bạn có thể truy cập hệ thống và bắt đầu học tập.</p>
        <p><a href="${process.env.FRONTEND_URL}/login">Đăng nhập ngay</a></p>
        <p>Trân trọng,<br>EduLearn Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email đăng ký gửi thành công cho ${email}`);
  } catch (error) {
    console.error('❌ Lỗi gửi email đăng ký:', error);
    // Không throw error, để app tiếp tục hoạt động
  }
};

// Gửi email cấp chứng chỉ
export const sendCertificateEmail = async (email, fullName, courseName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@elearning.com',
      to: email,
      subject: '🏆 Chúc mừng! Bạn đã hoàn thành khóa học',
      html: `
        <h1>🎉 Chúc mừng ${fullName}!</h1>
        <p>Bạn đã hoàn thành khóa học <strong>${courseName}</strong></p>
        <p>Chứng chỉ hoàn thành đã được cấp và có sẵn trong tài khoản của bạn.</p>
        <p><a href="${process.env.FRONTEND_URL}/profile">Xem chứng chỉ của tôi</a></p>
        <p>Trân trọng,<br>EduLearn Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email chứng chỉ gửi thành công cho ${email}`);
  } catch (error) {
    console.error('❌ Lỗi gửi email chứng chỉ:', error);
  }
};

// Gửi email đặt lại mật khẩu
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@elearning.com',
      to: email,
      subject: '🔐 Yêu cầu đặt lại mật khẩu',
      html: `
        <h1>Yêu cầu đặt lại mật khẩu</h1>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
        <p>Nhấp vào liên kết dưới đây để đặt lại mật khẩu:</p>
        <p><a href="${resetLink}">Đặt lại mật khẩu</a></p>
        <p><strong>Liên kết này sẽ hết hạn sau 1 giờ.</strong></p>
        <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
        <p>Trân trọng,<br>EduLearn Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email đặt lại mật khẩu gửi thành công cho ${email}`);
  } catch (error) {
    console.error('❌ Lỗi gửi email đặt lại mật khẩu:', error);
  }
};

// Test gửi email
export const testEmail = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email configuration is valid');
  } catch (error) {
    console.error('❌ Email configuration error:', error);
  }
};
