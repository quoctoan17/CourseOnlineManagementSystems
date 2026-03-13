import { verifyToken } from '../utils/auth.js';

// Middleware để kiểm tra token và lấy user info
export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer token

    if (!token) {
      return res.status(401).json({ error: 'Không có token, vui lòng đăng nhập' });
    }

    const decoded = verifyToken(token);
    req.user = decoded; // Lưu thông tin user vào request
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

// Middleware để kiểm tra quyền admin
export const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Bạn không có quyền truy cập resource này' });
  }
  next();
};

// Middleware để kiểm tra quyền instructor
export const instructorMiddleware = (req, res, next) => {
  if (req.user?.role !== 'instructor' && req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Bạn không có quyền truy cập resource này' });
  }
  next();
};
