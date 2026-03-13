import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/app/components/Layout';
import { courseService, categoryService } from '@/services/api';
import { usePaginatedApi } from '@/hooks';
import { Search, Filter, Users, Star } from 'lucide-react';

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor_name: string;
  category_name: string;
  student_count: number;
  status: 'active' | 'inactive' | 'published' | 'draft';
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function CourseListPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const {
    data: courses,
    page,
    totalPages,
    loading: coursesLoading,
    error: coursesError,
    goToPage,
  } = usePaginatedApi(async (pageNum, limit) => {
    let response;
    if (selectedCategory) {
      response = await courseService.getByCategory(selectedCategory, pageNum, limit);
    } else {
      response = await courseService.getAll(pageNum, limit);
    }
    return { data: response.data, totalPages: response.totalPages };
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await categoryService.getAll(1, 50);
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    goToPage(1);
  };

  const filteredCourses = searchQuery
    ? courses.filter((c: Course) =>
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : courses;

  if (coursesLoading && page === 1) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (coursesError) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <h2 className="font-bold mb-2">Đã xảy ra lỗi</h2>
              <p>{coursesError}</p>
              <button onClick={() => goToPage(1)} className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Khám phá khóa học</h1>
            <p className="text-gray-600">Chọn từ hàng trăm khóa học chất lượng cao</p>
          </div>

          {/* Filters */}
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                <Filter className="w-4 h-4 mr-2" />
                Danh mục
              </label>
              {categoriesLoading ? (
                <div className="text-gray-500">Đang tải danh mục...</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedCategory === null ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Tất cả
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        selectedCategory === category.id ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Không tìm thấy khóa học nào.</p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredCourses.map((course: Course) => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.slug || course.id}`}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                  >
                    <div className="w-full h-40 bg-gray-200 relative overflow-hidden">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover hover:scale-105 transition" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600">
                          <span className="text-white text-4xl">📚</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
                          {course.category_name || 'Chung'}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 hover:text-orange-600">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                      <p className="text-sm text-gray-700 mb-3">
                        <strong>Giảng viên:</strong> {course.instructor_name}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{course.student_count || 0} học viên</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                          <span>4.5</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      page === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    ← Trang trước
                  </button>
                  <div className="text-gray-700 font-medium">
                    Trang <span className="font-bold">{page}</span> / {totalPages}
                  </div>
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      page === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    Trang sau →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}