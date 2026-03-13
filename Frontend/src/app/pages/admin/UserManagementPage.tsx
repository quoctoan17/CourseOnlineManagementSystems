import { AdminLayout } from "./AdminLayout";
import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, UserPlus, Filter, X } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api';
function getToken() { return localStorage.getItem('token') || ''; }
function authHeaders() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }; }

const ROLES = { admin: 'Quản trị viên', instructor: 'Giảng viên', student: 'Học viên' };
const ROLE_COLORS = { admin: 'bg-purple-100 text-purple-800', instructor: 'bg-orange-100 text-orange-800', student: 'bg-gray-100 text-gray-800' };
const EMPTY_FORM = { full_name: '', email: '', password: '', role: 'student' };

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users?limit=100`, { headers: authHeaders() });
      const data = await res.json();
      setUsers(data.data || data.users || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdd = async () => {
    if (!form.full_name || !form.email || !form.password) { alert('Vui lòng điền đầy đủ thông tin'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ full_name: form.full_name, email: form.email, password: form.password, role: form.role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi');
      setShowAddModal(false); setForm(EMPTY_FORM); await fetchUsers(); showToast('✅ Tạo người dùng thành công');
    } catch (err) { alert('Lỗi: ' + err.message); } finally { setSaving(false); }
  };

  const openEdit = (u) => {
    setSelected(u);
    setForm({ full_name: u.full_name || u.name || '', email: u.email || '', password: '', role: u.role || 'student' });
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    setSaving(true);
    try {
      const body = { full_name: form.full_name, email: form.email, role: form.role };
      if (form.password) body.password = form.password;
      const res = await fetch(`${API_BASE}/users/${selected.id}`, {
        method: 'PUT', headers: authHeaders(), body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi');
      setShowEditModal(false); await fetchUsers(); showToast('✅ Cập nhật thành công');
    } catch (err) { alert('Lỗi: ' + err.message); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/users/${selected.id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi');
      setShowDeleteModal(false); await fetchUsers(); showToast('✅ Xóa thành công');
    } catch (err) { alert('Lỗi: ' + err.message); } finally { setSaving(false); }
  };

  const filtered = users.filter((u) => {
    const name = u.full_name || u.name || '';
    const matchSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const formFields = (isEdit = false) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
        <input type="text" value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Nguyễn Văn A" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="email@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{isEdit ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}</label>
        <input type="password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="••••••••" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
        <select value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
          <option value="student">Học viên</option>
          <option value="instructor">Giảng viên</option>
          <option value="admin">Quản trị viên</option>
        </select>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-8">
        {toast && <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">{toast}</div>}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
            <p className="text-gray-600 mt-1">Quản lý tất cả người dùng trong hệ thống</p>
          </div>
          <button onClick={() => { setForm(EMPTY_FORM); setShowAddModal(true); }}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2">
            <UserPlus className="h-5 w-5" /> Thêm người dùng
          </button>
        </div>

        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo tên hoặc email..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white min-w-[180px]">
                <option value="all">Tất cả vai trò</option>
                <option value="student">Học viên</option>
                <option value="instructor">Giảng viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          {loading ? <div className="p-12 text-center text-gray-500">Đang tải...</div>
            : filtered.length === 0 ? <div className="p-12 text-center text-gray-500">Không tìm thấy người dùng nào</div>
            : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Tên', 'Email', 'Vai trò', 'Trạng thái', 'Ngày tham gia', 'Hành động'].map((h, i) => (
                      <th key={i} className={`px-6 py-4 text-sm font-semibold text-gray-900 ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((u) => {
                    const name = u.full_name || u.name || '?';
                    return (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[u.role] || ROLE_COLORS.student}`}>
                            {ROLES[u.role] || 'Học viên'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${u.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {u.status === 'inactive' ? 'Không hoạt động' : 'Hoạt động'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEdit(u)} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition"><Edit className="h-5 w-5" /></button>
                            <button onClick={() => { setSelected(u); setShowDeleteModal(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="h-5 w-5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            { label: 'Tổng người dùng', value: users.length },
            { label: 'Học viên', value: users.filter(u => u.role === 'student').length },
            { label: 'Hoạt động', value: users.filter(u => u.status !== 'inactive').length },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-lg border p-6">
              <p className="text-gray-600 mb-1">{s.label}</p>
              <p className="text-3xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Thêm người dùng</h2>
                <button onClick={() => setShowAddModal(false)}><X className="h-6 w-6 text-gray-400" /></button>
              </div>
              {formFields(false)}
              <div className="flex gap-4 pt-4">
                <button onClick={handleAdd} disabled={saving} className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50">{saving ? 'Đang lưu...' : 'Tạo người dùng'}</button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">Hủy</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Chỉnh sửa người dùng</h2>
                <button onClick={() => setShowEditModal(false)}><X className="h-6 w-6 text-gray-400" /></button>
              </div>
              {formFields(true)}
              <div className="flex gap-4 pt-4">
                <button onClick={handleEdit} disabled={saving} className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50">{saving ? 'Đang lưu...' : 'Cập nhật'}</button>
                <button onClick={() => setShowEditModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">Hủy</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
              <p className="text-gray-600 mb-6">Bạn có chắc muốn xóa người dùng <strong>"{selected?.full_name || selected?.name}"</strong>?</p>
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