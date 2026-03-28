import { AdminLayout } from './AdminLayout';
import { Users, BookOpen, TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const monthlyRevenue = [
  { month: 'T1', revenue: 45000000 },
  { month: 'T2', revenue: 52000000 },
  { month: 'T3', revenue: 48000000 },
  { month: 'T4', revenue: 61000000 },
  { month: 'T5', revenue: 55000000 },
  { month: 'T6', revenue: 67000000 },
];

const userGrowth = [
  { month: 'T1', users: 1200 },
  { month: 'T2', users: 1450 },
  { month: 'T3', users: 1680 },
  { month: 'T4', users: 1920 },
  { month: 'T5', users: 2150 },
  { month: 'T6', users: 2480 },
];

const categoryData = [
  { name: 'Lập trình', value: 35, color: '#3b82f6' },
  { name: 'Thiết kế', value: 25, color: '#10b981' },
  { name: 'Marketing', value: 20, color: '#f59e0b' },
  { name: 'Business', value: 15, color: '#8b5cf6' },
  { name: 'Khác', value: 5, color: '#ef4444' },
];

const topCourses = [
  { name: 'React & TypeScript', students: 1234, revenue: '1.234.566.000đ' },
  { name: 'UI/UX Design', students: 2103, revenue: '1.680.297.000đ' },
  { name: 'Digital Marketing', students: 3421, revenue: '2.391.279.000đ' },
  { name: 'Python Data Science', students: 1567, revenue: '1.878.733.000đ' },
  { name: 'Node.js Backend', students: 856, revenue: '769.544.000đ' },
];

export default function ReportsPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Báo cáo & Thống kê</h1>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-orange-600" />
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Tổng người dùng</p>
            <p className="text-3xl font-bold">2,480</p>
            <p className="text-green-600 text-sm mt-2">+15% so với tháng trước</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="h-8 w-8 text-green-600" />
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Tổng khóa học</p>
            <p className="text-3xl font-bold">221</p>
            <p className="text-green-600 text-sm mt-2">+8 khóa học mới</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-purple-600" />
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Lượt đăng ký</p>
            <p className="text-3xl font-bold">9,181</p>
            <p className="text-green-600 text-sm mt-2">+22% so với tháng trước</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Doanh thu tháng này</p>
            <p className="text-3xl font-bold">67M</p>
            <p className="text-green-600 text-sm mt-2">+12% so với tháng trước</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Doanh thu 6 tháng gần đây</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${(value as number / 1000000).toFixed(0)}M VND`} />
                <Bar dataKey="revenue" fill="#3b82f6" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Tăng trưởng người dùng</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} name="Người dùng" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution & Top Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Phân bố danh mục</h2>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Courses */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Top 5 khóa học</h2>
            <div className="space-y-4">
              {topCourses.map((course, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg text-orange-600">#{index + 1}</span>
                      <span className="font-semibold">{course.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{course.students} học viên</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{course.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
