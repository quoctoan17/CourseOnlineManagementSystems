import User from '../models/User.js';
import { hashPassword } from '../utils/auth.js';
import { sendPasswordResetEmail } from '../utils/email.js';

// LẤY TẤT CẢ USERS (chỉ admin)
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const users = await User.findAll(limit, offset);
    const total = await User.count();

    res.json({
      data: users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// LẤY THÔNG TIN USER THEO ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// CẬP NHẬT USER (admin hoặc user tự mình)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, role } = req.body;

    // Kiểm tra quyền (chỉ admin hoặc user tự mình)
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Không có quyền cập nhật' });
    }

    // User thường không thể đổi role
    if (req.user.role !== 'admin') {
      const userRole = (await User.findById(id))?.role;
      if (userRole && userRole !== role) {
        return res.status(403).json({ error: 'Không có quyền đổi role' });
      }
    }

    if (!fullName || !email || !role) {
      return res.status(400).json({ error: 'Vui lòng điền đủ thông tin' });
    }

    const user = await User.update(id, fullName, email, role);

    res.json({
      message: 'Cập nhật thành công',
      user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// XÓA USER (chỉ admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }

    // Không cho phép xóa admin user
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Không thể xóa user admin' });
    }

    await User.delete(id);

    res.json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// RESET PASSWORD (admin)
export const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'Vui lòng cung cấp mật khẩu mới' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }

    const hashedPassword = await hashPassword(newPassword);
    await User.updatePassword(id, hashedPassword);

    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// CẬP NHẬT HỒ SƠ CÁ NHÂN (user tự update)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const fullName = req.body.fullName ?? req.body.full_name;
    const { email } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ error: 'Vui lòng điền đủ thông tin' });
    }

    // Kiểm tra email đã tồn tại (trừ user hiện tại)
    const existingUser = await User.findByEmail(email);
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ error: 'Email đã được sử dụng' });
    }

    // Lấy role hiện tại (user không thể đổi role)
    const currentUser = await User.findById(userId);
    const updatedUser = await User.update(userId, fullName, email, currentUser.role);

    res.json({
      message: 'Cập nhật thông tin thành công',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// YÊU CẦU RESET PASSWORD (self-service)
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Vui lòng cung cấp email' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      // Không tiết lộ tài khoản có tồn tại hay không (security best practice)
      return res.json({ 
        message: 'Nếu tài khoản tồn tại, link reset mật khẩu sẽ được gửi' 
      });
    }

    // TODO: Trong production, dùng JWT token hoặc reset token với TTL
    // Ở đây tạm thời chỉ gửi email
    const resetToken = Buffer.from(user.id.toString()).toString('base64');
    
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({ 
      message: 'Nếu tài khoản tồn tại, link reset mật khẩu sẽ được gửi',
      // development only:
      resetToken: resetToken // TODO: remove in production
    });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};
