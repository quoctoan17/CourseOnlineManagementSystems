import { Layout } from '@/app/components/Layout';
import { useEffect, useState } from 'react';
import { TrendingUp, Award, Clock, Target } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { progressService, enrollmentService } from '@/services/api';

function formatTotalTime(seconds: number): string {
  if (!seconds || seconds === 0) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
}

export default function LearningProgressPage() {
  const { user } = useAuth();
  const [allProgress, setAllProgress] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [courseProgress, setCourseProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const progressRes: any = await progressService.getMyProgress();
        const progress = progressRes.data || [];
        setAllProgress(progress);

        const enrollRes: any = await enrollmentService.getMyEnrolledCourses(1, 100);
        const courses = enrollRes.data || [];
        setEnrolledCourses(courses);

        const courseProgressList = await Promise.all(
          courses.map(async (c: any) => {
            try {
              const res: any = await progressService.getStudentProgress(String(c.id || c.course_id));
              return {
                id: c.id || c.course_id,
                title: c.title || c.course_title,
                percent: Math.round(res.summary?.progressPercentage || 0),
                completed: res.summary?.completedLessons || 0,
                total: res.summary?.totalLessons || 0,
              };
            } catch {
              return {
                id: c.id || c.course_id,
                title: c.title || c.course_title,
                percent: 0,
                completed: 0,
                total: 0,
              };
            }
          })
        );
        setCourseProgress(courseProgressList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const completedLessons = allProgress.filter((p: any) => p.completed).length;
  const completedCourses = courseProgress.filter((c) => c.percent === 100).length;
  const avgProgress = courseProgress.length
    ? Math.round(courseProgress.reduce((s, c) => s + c.percent, 0) / courseProgress.length)
    : 0;

  // Tính từ duration thật — chỉ tính bài đã hoàn thành
  const totalCompletedSeconds = enrolledCourses.reduce((sum: number, c: any) => {
    return sum + (parseInt(c.completed_duration_seconds) || 0);
  }, 0);

  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const weeklyData = days.map((day, i) => {
    const count = allProgress.filter((p: any) => {
      if (!p.completed_at) return false;
      const d = new Date(p.completed_at).getDay();
      const mapped = d === 0 ? 6 : d - 1;
      return mapped === i;
    }).length;
    return { day, lessons: count };
  });

  const monthlyMap: Record<string, number> = {};
  allProgress.forEach((p: any) => {
    if (!p.completed_at || !p.completed) return;
    const m = new Date(p.completed_at).getMonth() + 1;
    const key = `T${m}`;
    monthlyMap[key] = (monthlyMap[key] || 0) + 1;
  });
  const monthlyData = Object.entries(monthlyMap)
    .map(([month, completed]) => ({ month, completed }))
    .slice(-6);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px] text-gray-500">Đang tải...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Tiến độ học tập</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: <Clock className="h-8 w-8 text-blue-500" />,
              value: formatTotalTime(totalCompletedSeconds),
              label: 'Tổng giờ học',
            },
            {
              icon: <Award className="h-8 w-8 text-yellow-500" />,
              value: `${completedCourses}`,
              label: 'Khóa học hoàn thành',
            },
            {
              icon: <Target className="h-8 w-8 text-green-500" />,
              value: `${avgProgress}%`,
              label: 'Tiến độ trung bình',
            },
            {
              icon: <TrendingUp className="h-8 w-8 text-purple-500" />,
              value: `${completedLessons}`,
              label: 'Bài học đã hoàn thành',
            },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-2">
                {s.icon}
                <span className="text-2xl font-bold">{s.value}</span>
              </div>
              <p className="text-gray-600 text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-xl font-bold mb-4">Bài học hoàn thành trong tuần</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="lessons" fill="#f97316" name="Bài học" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-xl font-bold mb-4">Bài học hoàn thành theo tháng</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData.length > 0 ? monthlyData : [{ month: 'Chưa có', completed: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#10b981" name="Bài học" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-xl font-bold mb-6">Tiến độ từng khóa học</h2>
          {courseProgress.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Bạn chưa tham gia khóa học nào</p>
          ) : (
            <div className="space-y-5">
              {courseProgress.map((course) => (
                <div key={course.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium text-gray-900">{course.title}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{course.completed}/{course.total} bài</span>
                      <span className="text-orange-500 font-semibold min-w-[42px] text-right">{course.percent}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${course.percent === 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                      style={{ width: `${course.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}