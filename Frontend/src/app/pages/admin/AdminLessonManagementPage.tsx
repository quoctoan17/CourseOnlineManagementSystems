import { Layout } from '@/app/components/Layout';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, X, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const PAGE_SIZE = 7;

function getToken() { return localStorage.getItem('token') || ''; }
function authHeaders() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }; }
const EMPTY_FORM = { title: '', video_url: '', lesson_order: 1, duration: '' };

export default function AdminLessonManagementPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseRes, lessonRes] = await Promise.all([
        fetch(`${API_BASE}/courses/${courseId}`, { headers: authHeaders() }),
        fetch(`${API_BASE}/lessons/course/${courseId}`, { headers: authHeaders() }),
      ]);
      const courseData = await courseRes.json();
      const lessonData = await lessonRes.json();
      setCourse(courseData.course);
      setLessons((lessonData.data || []).sort((a: any, b: any) => a.lesson_order - b.lesson_order));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (courseId) fetchData(); }, [courseId]);

  // Pagination
  const totalPages = Math.ceil(lessons.length / PAGE_SIZE);
  const paginated = lessons.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAdd = async () => {
    if (!form.title) { alert('Vui lòng nhập tên bài học'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/lessons`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ courseId: parseInt(courseId!), title: form.title, videoUrl: form.video_url || null, lessonOrder: parseInt(String(form.lesson_order)) || lessons.length + 1, duration: form.duration || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi');
      setShowAddModal(false); setForm(EMPTY_FORM); await fetchData();
      // Nhảy đến trang cuối sau khi thêm
      setPage(Math.ceil((lessons.length + 1) / PAGE_SIZE));
      showToast('Tạo bài học thành công');
    } catch (err: any) { alert('Lỗi: ' + err.message); } finally { setSaving(false); }
  };

  const openEdit = (lesson: any) => {
    setSelectedLesson(lesson);
    setForm({ title: lesson.title || '', video_url: lesson.video_url || '', lesson_order: lesson.lesson_order || 1, duration: lesson.duration || '' });
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!form.title) { alert('Vui lòng nhập tên bài học'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/lessons/${selectedLesson.id}`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ title: form.title, videoUrl: form.video_url || null, lessonOrder: parseInt(String(form.lesson_order)) || selectedLesson.lesson_order, duration: form.duration || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi');
      setShowEditModal(false); await fetchData(); showToast('Cập nhật thành công');
    } catch (err: any) { alert('Lỗi: ' + err.message); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/lessons/${selectedLesson.id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi');
      setShowDeleteModal(false);
      await fetchData();
      // Nếu trang hiện tại không còn data thì lùi 1 trang
      const newTotal = lessons.length - 1;
      const newTotalPages = Math.ceil(newTotal / PAGE_SIZE);
      if (page > newTotalPages) setPage(Math.max(1, newTotalPages));
      showToast('Xóa thành công');
    } catch (err: any) { alert('Lỗi: ' + err.message); } finally { setSaving(false); }
  };

  const formFields = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tên bài học *</label>
        <input type="text" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Nhập tên bài học" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">URL Video</label>
        <input type="text" value={form.video_url} onChange={(e) => setForm(f => ({ ...f, video_url: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="https://youtube.com/..." />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Thứ tự bài học</label>
        <input type="number" min={1} value={form.lesson_order} onChange={(e) => setForm(f => ({ ...f, lesson_order: parseInt(e.target.value) || 1 }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Thời lượng <span className="text-gray-400 font-normal">(MM:SS, ví dụ: 15:30)</span></label>
        <input type="text" value={form.duration} onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="15:30" />
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {toast && <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">{toast}</div>}

        <div className="mb-6">
          <Link to="/admin/courses" className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 mb-4 text-sm">
            <ChevronLeft className="h-4 w-4" /> Quay lại quản lý khóa học
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">Quản lý bài học</h1>
              {course && <p className="text-gray-600 mt-1">Khóa học: <span className="font-medium text-gray-800">{course.title}</span></p>}
            </div>
            <button onClick={() => { setForm({ ...EMPTY_FORM, lesson_order: lessons.length + 1 }); setShowAddModal(true); }}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2">
              <Plus className="h-5 w-5" /> Thêm bài học
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Đang tải...</div>
          ) : lessons.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Chưa có bài học nào</p>
              <button onClick={() => { setForm({ ...EMPTY_FORM, lesson_order: 1 }); setShowAddModal(true); }}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition">
                Thêm bài học đầu tiên
              </button>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{lessons.length} bài học</span>
                {totalPages > 1 && (
                  <span className="text-sm text-gray-500">Trang {page}/{totalPages}</span>
                )}
              </div>

              <div className="divide-y divide-gray-100">
                {paginated.map((lesson: any) => (
                  <div key={lesson.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
                      {lesson.lesson_order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{lesson.title}</div>
                      {lesson.video_url ? (
                        <a href={lesson.video_url} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-orange-500 hover:underline truncate block max-w-md">
                          {lesson.video_url}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">Chưa có video</span>
                      )}
                    </div>
                    {lesson.duration && (
                      <span className="text-sm text-gray-500 flex-shrink-0">{lesson.duration}</span>
                    )}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => openEdit(lesson)} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => { setSelectedLesson(lesson); setShowDeleteModal(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
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
              )}
            </>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Thêm bài học mới</h2>
                <button onClick={() => setShowAddModal(false)}><X className="h-6 w-6 text-gray-400" /></button>
              </div>
              {formFields}
              <div className="flex gap-4 pt-6">
                <button onClick={handleAdd} disabled={saving} className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50">{saving ? 'Đang lưu...' : 'Tạo bài học'}</button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">Hủy</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Chỉnh sửa bài học</h2>
                <button onClick={() => setShowEditModal(false)}><X className="h-6 w-6 text-gray-400" /></button>
              </div>
              {formFields}
              <div className="flex gap-4 pt-6">
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
              <p className="text-gray-600 mb-6">Bạn có chắc muốn xóa bài học <strong>"{selectedLesson?.title}"</strong>?</p>
              <div className="flex gap-4">
                <button onClick={handleDelete} disabled={saving} className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50">{saving ? 'Đang xóa...' : 'Xóa'}</button>
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">Hủy</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}