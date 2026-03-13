// API Service for communicating with backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

// Get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Set common headers including Authorization
const getHeaders = (customHeaders?: Record<string, string>): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers: customHeaders } = options;

  const config: RequestInit = {
    method,
    headers: getHeaders(customHeaders),
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 - token expired or invalid
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

// ============== AUTHENTICATION ENDPOINTS ==============
export const authService = {
  register: (fullName: string, email: string, password: string, confirmPassword?: string) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: { fullName, email, password, confirmPassword },
    }),

  login: (email: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  getMe: () =>
    apiRequest('/auth/me', { method: 'GET' }),

  changePassword: (currentPassword: string, newPassword: string, confirmPassword?: string) =>
    apiRequest('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword, confirmPassword },
    }),
    checkEmail: (email: string) =>
    apiRequest("/auth/check-email", {
      method: "POST",
      body: { email },
    }),
  resetPassword: (email: string, newPassword: string, confirmPassword: string) =>
    apiRequest("/auth/reset-password", {
      method: "POST",
      body: { email, newPassword, confirmPassword },
    }),
};

// ============== USER ENDPOINTS ==============
export const userService = {
  getAll: (page: number = 1, limit: number = 10) =>
    apiRequest(`/users?page=${page}&limit=${limit}`),

  getById: (id: string) =>
    apiRequest(`/users/${id}`),

  update: (id: string, data: any) =>
    apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: data,
    }),

  updateProfile: (data: { full_name?: string; email?: string; avatar?: string }) =>
    apiRequest('/users/profile/update', {
      method: 'PUT',
      body: data,
    }),

  resetPassword: (userId: string, newPassword: string) =>
    apiRequest(`/users/${userId}/reset-password`, {
      method: 'POST',
      body: { new_password: newPassword },
    }),

  requestPasswordReset: (email: string) =>
    apiRequest('/users/forgot-password', {
      method: 'POST',
      body: { email },
    }),

  delete: (id: string) =>
    apiRequest(`/users/${id}`, { method: 'DELETE' }),
};

// ============== CATEGORY ENDPOINTS ==============
export const categoryService = {
  getAll: (page: number = 1, limit: number = 10) =>
    apiRequest(`/categories?page=${page}&limit=${limit}`),

  getById: (id: string) =>
    apiRequest(`/categories/${id}`),

  create: (data: { name: string; description?: string }) =>
    apiRequest('/categories', {
      method: 'POST',
      body: data,
    }),

  update: (id: string, data: any) =>
    apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: string) =>
    apiRequest(`/categories/${id}`, { method: 'DELETE' }),
};

// ============== COURSE ENDPOINTS ==============
export const courseService = {
  getAll: (page: number = 1, limit: number = 10, categoryId?: string) => {
    let url = `/courses?page=${page}&limit=${limit}`;
    if (categoryId) url += `&category_id=${categoryId}`;
    return apiRequest(url);
  },

  getById: (id: string) =>
    apiRequest(`/courses/${id}`),

  getByCategory: (categoryId: string, page: number = 1, limit: number = 10) =>
    apiRequest(`/courses/category/${categoryId}?page=${page}&limit=${limit}`),

  getInstructorCourses: (page: number = 1, limit: number = 10) =>
    apiRequest(`/courses/instructor/my-courses?page=${page}&limit=${limit}`),

  create: (data: {
    title: string;
    description: string;
    thumbnail?: string;
    category_id: string;
  }) =>
    apiRequest('/courses', {
      method: 'POST',
      body: data,
    }),

  update: (id: string, data: any) =>
    apiRequest(`/courses/${id}`, {
      method: 'PUT',
      body: data,
    }),

  updateStatus: (id: string, status: 'active' | 'inactive') =>
    apiRequest(`/courses/${id}/status`, {
      method: 'PATCH',
      body: { status },
    }),

  delete: (id: string) =>
    apiRequest(`/courses/${id}`, { method: 'DELETE' }),
};

// ============== LESSON ENDPOINTS ==============
export const lessonService = {
  getByCourse: (courseId: string) =>
    apiRequest(`/lessons/course/${courseId}`),

  getById: (id: string) =>
    apiRequest(`/lessons/${id}`),

  getNext: (courseId: string, lessonOrder: number) =>
    apiRequest(`/lessons/course/${courseId}/next/${lessonOrder}`),

  create: (data: {
    course_id: string;
    title: string;
    video_url?: string;
    lesson_order: number;
  }) =>
    apiRequest('/lessons', {
      method: 'POST',
      body: data,
    }),

  update: (id: string, data: any) =>
    apiRequest(`/lessons/${id}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: string) =>
    apiRequest(`/lessons/${id}`, { method: 'DELETE' }),
};

// ============== ENROLLMENT ENDPOINTS ==============
export const enrollmentService = {
  getMyEnrolledCourses: (page: number = 1, limit: number = 10) =>
    apiRequest(`/enrollments/my-courses?page=${page}&limit=${limit}`),

  getEnrolledStudents: (courseId: string, page: number = 1, limit: number = 10) =>
    apiRequest(`/enrollments/course/${courseId}/students?page=${page}&limit=${limit}`),

  checkEnrollment: (courseId: string) =>
    apiRequest(`/enrollments/check/${courseId}`),

  enroll: (courseId: string) =>
    apiRequest('/enrollments', {
      method: 'POST',
      body: { course_id: courseId },
    }),

  unenroll: (courseId: string) =>
    apiRequest(`/enrollments/${courseId}`, { method: 'DELETE' }),

  updateStatus: (courseId: string, status: 'active' | 'completed') =>
    apiRequest(`/enrollments/${courseId}/status`, {
      method: 'PATCH',
      body: { status },
    }),
};

// ============== PROGRESS ENDPOINTS ==============
export const progressService = {
  updateProgress: (lessonId: string, courseId: string) =>
    apiRequest('/progress', {
      method: 'POST',
      body: { lessonId, completed: true },
    }),

  getStudentProgress: (courseId: string) =>
    apiRequest(`/progress/course/${courseId}`),

  getMyProgress: () =>
    apiRequest('/progress/my-progress'),

  checkCompletion: (lessonId: string) =>
    apiRequest(`/progress/check/${lessonId}`),

  getCourseStats: (courseId: string) =>
    apiRequest(`/progress/course/${courseId}/stats`),
};

// ============== CERTIFICATE ENDPOINTS ==============
export const certificateService = {
  getMyCertificates: () =>
    apiRequest('/certificates/my-certificates'),

  getById: (id: string) =>
    apiRequest(`/certificates/${id}`),

  checkStatus: (courseId: string) =>
    apiRequest(`/certificates/check/${courseId}`),

  issue: (userId: string, courseId: string) =>
    apiRequest('/certificates', {
      method: 'POST',
      body: { user_id: userId, course_id: courseId },
    }),

  getCourseCertificates: (courseId: string) =>
    apiRequest(`/certificates/course/${courseId}`),

  delete: (id: string) =>
    apiRequest(`/certificates/${id}`, { method: 'DELETE' }),

  autoIssue: () =>
    apiRequest('/certificates/admin/auto-issue', { method: 'POST' }),
};

// ============== REPORT ENDPOINTS ==============
export const reportService = {
  getSystemStatistics: () =>
    apiRequest('/reports/system/statistics'),

  getCourseStatistics: (courseId: string) =>
    apiRequest(`/reports/course/${courseId}/statistics`),

  getStudentStatistics: (courseId: string, page: number = 1, limit: number = 10) =>
    apiRequest(`/reports/course/${courseId}/students?page=${page}&limit=${limit}`),

  getInstructorStatistics: (instructorId: string) =>
    apiRequest(`/reports/instructor/${instructorId}`),

  getTopCourses: (limit: number = 10) =>
    apiRequest(`/reports/top-courses?limit=${limit}`),

  getMonthlyReport: (year: number, month: number) =>
    apiRequest(`/reports/monthly/${year}/${month}`),
};

export default {
  authService,
  userService,
  categoryService,
  courseService,
  lessonService,
  enrollmentService,
  progressService,
  certificateService,
  reportService,
};
