import { AdminLayout } from "./AdminLayout";
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Folder, X } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api';
function getToken() { return localStorage.getItem('token') || ''; }
function authHeaders() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }; }
const EMPTY_FORM = { name: '', description: '' };

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/categories?limit=100`, { headers: authHeaders() });
      const data = await res.json();
      setCategories(data.data || data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async () => {
    if (!form.name) { alert('Vui lòng nhập tên danh mục'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ name: form.name, description: form.description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi');
      setShowAddModal(false); setForm(EMPTY_FORM); await fetchCategories(); showToast('✅ Tạo danh mục thành công');
    } catch (err) { alert('Lỗi: ' + err.message); } finally { setSaving(false); }
  };

  const openEdit = (cat) => {
    setSelected(cat);
    setForm({ name: cat.name || '', description: cat.description || '' });
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!form.name) { alert('Vui lòng nhập tên danh mục'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/categories/${selected.id}`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ name: form.name, description: form.description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi');
      setShowEditModal(false); await fetchCategories(); showToast('✅ Cập nhật thành công');
    } catch (err) { alert('Lỗi: ' + err.message); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/categories/${selected.id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi');
      setShowDeleteModal(false); await fetchCategories(); showToast('✅ Xóa thành công');
    } catch (err) { alert('Lỗi: ' + err.message); } finally { setSaving(false); }
  };

  const formFields = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
        <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Nhập tên danh mục" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
        <textarea rows={3} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Nhập mô tả danh mục" />
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-8">
        {toast && <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">{toast}</div>}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Quản lý danh mục</h1>
            <p className="text-gray-600 mt-1">Quản lý các danh mục khóa học</p>
          </div>
          <button onClick={() => { setForm(EMPTY_FORM); setShowAddModal(true); }}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2">
            <Plus className="h-5 w-5" /> Thêm danh mục
          </button>
        </div>

        {loading ? <div className="text-center py-12 text-gray-500">Đang tải...</div> : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white rounded-xl border p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <Folder className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{cat.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">Hoạt động</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 min-h-[40px]">{cat.description || 'Không có mô tả'}</p>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-gray-500">{cat.course_count || 0} khóa học</span>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(cat)} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => { setSelected(cat); setShowDeleteModal(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Tổng danh mục', value: categories.length },
                { label: 'Tổng khóa học', value: categories.reduce((s, c) => s + (parseInt(c.course_count) || 0), 0) },
                { label: 'TB mỗi danh mục', value: categories.length ? Math.round(categories.reduce((s, c) => s + (parseInt(c.course_count) || 0), 0) / categories.length) : 0 },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-lg border p-6">
                  <p className="text-gray-600 mb-1">{s.label}</p>
                  <p className="text-3xl font-bold">{s.value}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Thêm danh mục mới</h2>
                <button onClick={() => setShowAddModal(false)}><X className="h-6 w-6 text-gray-400" /></button>
              </div>
              {formFields}
              <div className="flex gap-4 pt-4">
                <button onClick={handleAdd} disabled={saving} className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50">{saving ? 'Đang lưu...' : 'Tạo danh mục'}</button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">Hủy</button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Chỉnh sửa danh mục</h2>
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
              <p className="text-gray-600 mb-6">Bạn có chắc muốn xóa danh mục <strong>"{selected?.name}"</strong>?</p>
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