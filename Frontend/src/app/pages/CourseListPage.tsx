import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/app/components/Layout';
import { courseService, categoryService } from '@/services/api';
import { Search, Filter, Users, Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor_name: string;
  category_name: string;
  student_count: number;
  price: number;
  status: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

export default function CourseListPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load categories một lần
  useEffect(() => {
    categoryService.getAll(1, 50).then((res: any) => {
      setCategories(res.data || []);
    }).catch(console.error);
  }, []);

  // Load courses mỗi khi category hoặc page thay đổi
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        let res: any;
        if (selectedCategory) {
          res = await courseService.getByCategory(selectedCategory, page, 12);
        } else {
          res = await courseService.getAll(page, 12);
        }
        setCourses(res.data || []);
        setTotalPages(res.totalPages || 1);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedCategory, page]);

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setPage(1); // reset về trang 1 khi đổi danh mục
  };

  const formatPrice = (price?: number) => {
    if (!price || price === 0) return "Miễn phí";
    return price.toLocaleString("vi-VN") + " VND";
  };

  const filteredCourses = searchQuery
    ? courses.filter((c) =>
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : courses;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Khám phá khóa học</h1>
            <p className="text-gray-600">Chọn từ hàng trăm khóa học chất lượng cao</p>
          </div>

          {/* Filters */}
          <div className="mb-8 bg-white rounded-xl shadow-sm border p-6">
            <div className="mb-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                <Filter className="w-4 h-4 mr-2" />
                Danh mục
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedCategory === null ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tất cả
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedCategory === cat.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl h-72 border" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-lg">
              Không tìm thấy khóa học nào.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredCourses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.slug || course.id}`}
                    className="bg-white rounded-xl border hover:shadow-lg transition overflow-hidden group"
                  >
                    <div className="w-full h-44 bg-gray-100 overflow-hidden">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600">
                          <span className="text-white text-4xl">📚</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                        {course.category_name || 'Chung'}
                      </span>
                      <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2 group-hover:text-orange-500 transition">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course.description}</p> 
                      <p className="text-sm text-gray-700 mb-3">
                        <span className="text-gray-400">Giảng viên:</span> {course.instructor_name}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{course.student_count || 0} học viên</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>4.9</span>
                        </div>
                      </div>
                      <hr className="border-t border-gray-200 my-3" />
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold text-orange-600">
                          {formatPrice(course.price)}
                        </div>
                        <span className="bg-orange-500 text-white text-sm px-4 py-2 rounded-lg group-hover:bg-orange-600 transition">
                          Xem chi tiết
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed bg-white border hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" /> Trang trước
                  </button>
                  <span className="text-gray-700 font-medium">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed bg-white border hover:bg-gray-50"
                  >
                    Trang sau <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}