import Category from '../models/Category.js';

// TẠO CATEGORY MỚI (chỉ admin)
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Vui lòng cung cấp tên category' });
    }

    const category = await Category.create(name, description || null);

    res.status(201).json({
      message: 'Tạo category thành công',
      category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// LẤY TẤT CẢ CATEGORIES
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();

    res.json({
      data: categories,
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// LẤY CATEGORY THEO ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'Category không tồn tại' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Get category by id error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// CẬP NHẬT CATEGORY (chỉ admin)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Vui lòng cung cấp tên category' });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'Category không tồn tại' });
    }

    const updatedCategory = await Category.update(id, name, description || category.description);

    res.json({
      message: 'Cập nhật category thành công',
      category: updatedCategory,
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// XÓA CATEGORY (chỉ admin)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'Category không tồn tại' });
    }

    await Category.delete(id);

    res.json({ message: 'Xóa category thành công' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};
