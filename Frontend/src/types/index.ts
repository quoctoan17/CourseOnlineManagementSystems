export interface User {
  id: number;
  full_name: string;
  email: string;
  password?: string;
  role: 'student' | 'instructor' | 'admin';
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  status?: string;
  thumbnail?: string;
  instructor_id: number;
  instructor_name?: string;
  category_id?: number;
  category_name?: string;
  slug?: string;
  student_count?: number;
  created_at?: string;
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  video_url?: string;
  lesson_order: number;
  duration?: string;
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  course_title?: string;
  progress_percentage?: number;
  enrolled_at?: string;
  status: 'active' | 'completed';
}

export interface Progress {
  id: number;
  user_id: number;
  lesson_id: number;
  completed: boolean;
  completed_at?: string;
}

export interface Payment {
  id: number;
  user_id: number;
  course_id: number;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  method?: string;
  created_at?: string;
}