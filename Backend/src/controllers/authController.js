import User from '../models/User.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';

// ĐĂNG KÝ
export const register = async (req, res) => {
  try {
    const fullName = req.body.fullName ?? req.body.full_name;
    const { email, password } = req.body;
    const confirmPassword = req.body.confirmPassword ?? req.body.confirm_password;

    // Validate input
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng điền đủ thông tin' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Mật khẩu không khớp' });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email đã được đăng ký' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Tạo user
    const newUser = await User.create(fullName, email, hashedPassword, 'student');

    // Tự động đăng nhập sau đăng ký
    const token = generateToken(newUser.id, newUser.role);

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// ĐĂNG NHẬP
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu' });
    }

    // Tìm user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }

    // Kiểm tra password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }

    // Tạo token
    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// THAY ĐỔI MẬT KHẨU
// KIỂM TRA EMAIL ĐỂ RESET PASSWORD
export const checkEmailForReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Vui lòng nhập email" });
    }

    const user = await User.findByEmail(email.trim());

    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    return res.json({ message: "Email hợp lệ", exists: true });

  } catch (error) {
    console.error("checkEmailForReset error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// RESET PASSWORD (KHÔNG CẦN LOGIN)
export const resetPasswordByEmail = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: "Thiếu thông tin" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Mật khẩu không khớp" });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({ error: "Email không tồn tại" });
    }

    const hashedPassword = await hashPassword(newPassword);

    await User.updatePassword(user.id, hashedPassword);

    res.json({
      message: "Đổi mật khẩu thành công"
    });

  } catch (error) {
    res.status(500).json({ error: "Lỗi server" });
  }
};

// LẤY THÔNG TIN USER HIỆN TẠI
export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }

    res.json({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};
