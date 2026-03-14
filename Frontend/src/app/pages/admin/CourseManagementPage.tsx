import { AdminLayout } from "./AdminLayout";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Edit, Trash2, Plus, X, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api';
const PAGE_SIZE = 8;
function getToken() { return localStorage.getItem('token') || ''; }
function authHeaders() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }; }
const EMPTY_FORM = { title: '', description: '', price: '', category_id: '', thumbnail: '' };

export default function CourseManagementPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/courses?limit=1000`, { headers: authHeaders() });
      const data = await res.json();
      setCourses(data.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`, { headers: authHeaders() });
      const data = await res.json();
      setCategories(data.data || data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCourses(); fetchCategories(); }, []);

  // Reset page khi search thay đổi
  useEffect(() => { setPage(1); }, [searchTerm]);

  const handleAdd = async () => {
    if (!form.title || !form.description) { alert('Vui lòng điền tên và mô tả'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/courses`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ title: form.title, description: form.description, price: parseInt(form.price) || 0, category_id: form.category_id ? parseInt(form.category_id) : null, thumbnail: form.thumbnail || null, status: 'published' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi');
      setShowAddModal(false); setForm(EMPTY_FORM); await fetchCourses();
      showToast('Tạo khóa học thành công');
    } catch (err) { alert('Lỗi: ' + err.message); } finally { setSaving(false); }
  };

  const openEdit = (course) => {
    setSelectedCourse(course);
    setForm({ title: course.title || '', description: course.description || '', price: course.price || '', category_id: course.category_id || '', thumbnail: course.thumbnail || '' });
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!form.title || !form.description) { alert('Vui lòng điền tên và mô tả'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/courses/${selectedCourse.id}`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ title: form.title, description: form.description, price: parseInt(form.price) || 0, category_id: form.category_id ? parseInt(form.category_id) : null, thumbnail: form.thumbnail || selectedCourse.thumbnail || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi');
      setShowEditModal(false); await fetchCourses(); showToast('Cập nhật thành công');
    } catch (err) { alert('Lỗi: ' + err.message); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/courses/${selectedCourse.id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi');
      setShowDeleteModal(false); await fetchCourses();
      showToast('✅ Xóa thành công');
    } catch (err) { alert('Lỗi: ' + err.message); } finally { setSaving(false); }
  };

  // Filter + Pagination
  const filtered = courses.filter((c) =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const formFields = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh thumbnail (URL)</label>
        <input type="text" value={form.thumbnail} onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="https://..." />
        {form.thumbnail && <img src={form.thumbnail} alt="preview" className="mt-2 h-24 w-40 object-cover rounded-lg border" onError={(e) => e.currentTarget.style.display = 'none'} />}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tên khóa học</label>
        <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Nhập tên khóa học" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
        <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Nhập mô tả" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Giá</label>
          <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
          <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-8">
        {toast && <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">{toast}</div>}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Quản lý khóa học</h1>
            <p className="text-gray-600 mt-1">Quản lý tất cả khóa học trong hệ thống</p>
          </div>
          <button onClick={() => { setForm(EMPTY_FORM); setShowAddModal(true); }}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2">
            <Plus className="h-5 w-5" /> Thêm khóa học
          </button>
        </div>

        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm khóa học..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          {loading ? <div className="p-12 text-center text-gray-500">Đang tải...</div>
            : filtered.length === 0 ? <div className="p-12 text-center text-gray-500">Không tìm thấy khóa học nào</div>
            : (
              <>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {['Khóa học','Giảng viên','Học viên','Giá','Trạng thái','Ngày tạo','Hành động'].map((h, i) => (
                        <th key={i} className={`px-6 py-4 text-sm font-semibold text-gray-900 ${i === 6 ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginated.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium max-w-[180px] truncate">{course.title}</td>
                        <td className="px-6 py-4 text-gray-600">{course.instructor_name || '—'}</td>
                        <td className="px-6 py-4 text-gray-600">{course.student_count || 0}</td>
                        <td className="px-6 py-4 text-gray-600">{course.price ? Number(course.price).toLocaleString('vi-VN') + 'đ' : 'Miễn phí'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${course.status === 'published' || course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {course.status === 'published' || course.status === 'active' ? 'Đã xuất bản' : 'Nháp'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{course.created_at ? new Date(course.created_at).toLocaleDateString('vi-VN') : '—'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/admin/courses/${course.id}/lessons`} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Quản lý bài học">
                              <BookOpen className="h-5 w-5" />
                            </Link>
                            <button onClick={() => openEdit(course)} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition"><Edit className="h-5 w-5" /></button>
                            <button onClick={() => { setSelectedCourse(course); setShowDeleteModal(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="h-5 w-5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Hiển thị {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} khóa học
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white">
                        <ChevronLeft className="h-4 w-4" /> Trước
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                          <button key={p} onClick={() => setPage(p)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition ${p === page ? 'bg-orange-500 text-white' : 'hover:bg-gray-200 text-gray-600'}`}>
                            {p}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white">
                        Sau <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            { label: 'Tổng khóa học', value: courses.length },
            { label: 'Đã xuất bản', value: courses.filter((c) => c.status === 'published' || c.status === 'active').length },
            { label: 'Tổng số lượng đăng kí', value: courses.reduce((sum, c) => sum + (parseInt(c.student_count) || 0), 0) },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-lg border p-6">
              <p className="text-gray-600 mb-1">{s.label}</p>
              <p className="text-3xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Thêm khóa học mới</h2>
                <button onClick={() => setShowAddModal(false)}><X className="h-6 w-6 text-gray-400" /></button>
              </div>
              {formFields}
              <div className="flex gap-4 pt-4">
                <button onClick={handleAdd} disabled={saving} className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50">{saving ? 'Đang lưu...' : 'Tạo khóa học'}</button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">Hủy</button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Chỉnh sửa khóa học</h2>
                <button onClick={() => setShowEditModal(false)}><X className="h-6 w-6 text-gray-400" /></button>
              </div>
              {formFields}
              <div className="flex gap-4 pt-4">
                <button onClick={handleEdit} disabled={saving} className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50">{saving ? 'Đang lưu...' : 'Cập nhật'}</button>
                <button onClick={() => setShowEditModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">Hủy</button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
              <p className="text-gray-600 mb-6">Bạn có chắc muốn xóa <strong>"{selectedCourse?.title}"</strong>?</p>
              <div className="flex gap-4">
                <button onClick={handleDelete} disabled={saving} className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50">{saving ? 'Đang xóa...' : 'Xóa'}</button>
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">Hủy</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}