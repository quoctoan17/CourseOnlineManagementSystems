import { Layout } from '@/app/components/Layout';
import { useEffect, useState } from 'react';
import { TrendingUp, Award, Clock, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks';
import { progressService } from '@/services/api';

const weeklyData = [
  { day: 'T2', hours: 2.5 },
  { day: 'T3', hours: 3.2 },
  { day: 'T4', hours: 1.8 },
  { day: 'T5', hours: 4.0 },
  { day: 'T6', hours: 2.9 },
  { day: 'T7', hours: 3.5 },
  { day: 'CN', hours: 5.0 },
];

const monthlyProgress = [
  { month: 'T1', completed: 2 },
  { month: 'T2', completed: 3 },
  { month: 'T3', completed: 4 },
  { month: 'T4', completed: 3 },
];

export default function LearningProgressPage() {
  const { user } = useAuth();
  const { data: myProgress = [], loading, error } = useApi<any>(
    async () => progressService.getMyProgress()
  );

  // compute some summary stats for demonstration
  const totalLessonsCompleted = myProgress.filter((p: any) => p.completed).length;
  const uniqueCourses = Array.from(new Set(myProgress.map((p: any) => p.course_id))).length;
  // (hours not available, leave static)

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Tiến độ học tập</h1>

        {/* Stats Cards */}
        {loading && <p className="text-center py-4">Đang tải tiến độ...</p>}
        {error && <p className="text-center py-4 text-red-600">Lỗi: {error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-8 w-8 text-orange-600" />
                <span className="text-2xl font-bold">{/* static until hours tracked */}--h</span>
              </div>
              <p className="text-gray-600">Tổng giờ học</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-8 w-8 text-yellow-600" />
                <span className="text-2xl font-bold">{uniqueCourses}</span>
              </div>
              <p className="text-gray-600">Khóa học đã tham gia</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold">{uniqueCourses ? Math.round((totalLessonsCompleted / uniqueCourses) * 10) : 0}%</span>
              </div>
              <p className="text-gray-600">Tiến độ trung bình</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold">7</span>
              </div>
              <p className="text-gray-600">Ngày liên tục</p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Giờ học trong tuần</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#2563eb" name="Giờ học" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Khóa học hoàn thành theo tháng</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#10b981" name="Khóa học" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Progress */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Tiến độ từng khóa học</h2>
          <div className="space-y-4">
            {[
              { name: 'React & TypeScript', progress: 45 },
              { name: 'Node.js & Express', progress: 72 },
              { name: 'UI/UX Design', progress: 30 },
              { name: 'Digital Marketing', progress: 88 },
            ].map((course, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{course.name}</span>
                  <span className="text-orange-600 font-semibold">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-orange-600 h-3 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
