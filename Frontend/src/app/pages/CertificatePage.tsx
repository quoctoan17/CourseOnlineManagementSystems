import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/app/components/Layout';
import { certificateService } from '@/services/api';
import { Award, BookOpen, ChevronLeft, Printer } from 'lucide-react';

export default function CertificatePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res: any = await certificateService.getCourseCertificates(courseId!);
        setCert(res.certificate || res);
      } catch (err: any) {
        setError('Không tìm thấy chứng chỉ');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        Đang tải chứng chỉ...
      </div>
    </Layout>
  );

  if (error || !cert) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500">{error || 'Không tìm thấy chứng chỉ'}</p>
        <Link to="/my-courses" className="text-orange-500 hover:underline text-sm">
          ← Quay lại khóa học của tôi
        </Link>
      </div>
    </Layout>
  );

  const date = new Date(cert.issued_at).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Back */}
        <Link
          to="/my-courses"
          className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-600 mb-8 text-sm font-medium"
        >
          <ChevronLeft className="h-4 w-4" />
          Khóa học của tôi
        </Link>

        {/* Certificate Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-purple-600 p-8 text-white text-center">
            <Award className="h-16 w-16 mx-auto mb-3" />
            <h1 className="text-3xl font-bold">Chứng chỉ hoàn thành</h1>
            <p className="text-white/80 mt-1">JolibeeEdu</p>
          </div>

          {/* Body */}
          <div className="p-10 border-4 border-dashed border-orange-200 m-6 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 text-orange-500 mb-6">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wider">
                Chứng nhận rằng
              </span>
            </div>

            <p className="text-3xl font-bold text-gray-900 mb-4">
              {cert.student_name}
            </p>
            <p className="text-gray-500 mb-3">đã hoàn thành khóa học</p>
            <p className="text-2xl font-semibold text-orange-600 mb-6">
              "{cert.course_title}"
            </p>

            <div className="border-t border-gray-100 pt-6 mt-2">
              <p className="text-gray-400 text-sm">
                Ngày hoàn thành:{' '}
                <span className="font-semibold text-gray-700">{date}</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3 print:hidden">
            <Link
              to="/my-courses"
              className="flex-1 py-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm font-medium text-center"
            >
              Quay lại
            </Link>
            <button
              onClick={() => window.print()}
              className="flex-1 py-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition text-sm font-medium flex items-center justify-center gap-2"
            >
              <Printer className="h-4 w-4" />
              In chứng chỉ
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}