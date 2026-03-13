import { Layout } from '@/app/components/Layout';
import { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Calendar, Award, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/api';

export default function UserProfilePage() {
  const { user, getMe } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((f) => ({
        ...f,
        full_name: user.full_name,
        email: user.email,
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await userService.updateProfile({
        full_name: formData.full_name,
        email: formData.email,
      });
      await getMe(); // refresh context
      setSuccess(true);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Hồ sơ cá nhân</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-32 h-32 bg-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold">
                {user?.full_name?.charAt(0) || '?'}
              </div>
              <h2 className="text-xl font-bold mb-1">{user?.full_name || 'User'}</h2>
              <p className="text-gray-600 text-sm mb-4">{user?.role === 'admin' ? 'Quản trị viên' : 'Học viên'}</p>
              <button className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition">
                Đổi ảnh đại diện
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Thành tựu</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="font-semibold text-sm">12 Khóa học</p>
                    <p className="text-xs text-gray-600">Hoàn thành</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-semibold text-sm">7 Ngày</p>
                    <p className="text-xs text-gray-600">Học liên tục</p>
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/change-password"
              className="block w-full bg-gray-100 text-gray-700 text-center py-2 rounded-md hover:bg-gray-200 transition"
            >
              Đổi mật khẩu
            </Link>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Thông tin cá nhân</h2>
                <button
                  onClick={() => {
                    setIsEditing((p) => !p);
                    setSuccess(false);
                    setError(null);
                  }}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                </button>
              </div>

              {error && <p className="text-red-600 mb-4">{error}</p>}
              {success && <p className="text-green-600 mb-4">Cập nhật thành công</p>}

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  {/* Optional additional fields could be added */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <UserIcon className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Họ và tên</p>
                      <p className="font-medium">{formData.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                  </div>
                  {/* Additional profile fields if needed */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
