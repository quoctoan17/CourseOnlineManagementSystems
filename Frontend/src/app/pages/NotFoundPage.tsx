import { Link } from 'react-router-dom';
import { Layout } from '@/app/components/Layout';
import { BookOpen } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-12 h-12 text-orange-500" />
        </div>

        <h1 className="text-8xl font-bold text-orange-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Trang không tồn tại</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>

        <div className="flex gap-4">
          <Link
            to="/"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            Về trang chủ
          </Link>
          <Link
            to="/courses"
            className="border border-orange-500 text-orange-500 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition"
          >
            Xem khóa học
          </Link>
        </div>
      </div>
    </Layout>
  );
}